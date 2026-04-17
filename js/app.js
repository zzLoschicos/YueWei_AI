/**
 * 阅微 AI 诊断系统 · 企业级前端核心 JS
 * YueWei AI Diagnostic System — Enterprise Frontend Core
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   API Service
   ═══════════════════════════════════════════════════════════ */
const API = {
  // 指向真实后端服务器（阅微 AI server.js）
  baseURL: 'http://localhost:3002',

  async request(method, endpoint, data = null, options = {}) {
    const url = this.baseURL + endpoint;
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // 注入 Token
    const token = localStorage.getItem('yw_token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    } else if (data && method === 'GET') {
      const params = new URLSearchParams(
        Object.entries(data).filter(([, v]) => v != null)
      );
      config.url = url + '?' + params.toString();
    } else {
      config.url = url;
    }

    try {
      const response = await fetch(config.url || url, config);
      const json = await response.json();
      if (!response.ok) {
        // 401 跳转到登录页
        if (response.status === 401 && !options.noRedirect) {
          Toast.error('未授权', '请先登录');
          setTimeout(() => window.location.href = 'login.html', 1000);
          throw new Error('Unauthorized');
        }
        throw new Error(json.error || json.message || '请求失败');
      }
      return json;
    } catch (err) {
      if (options.silent) throw err;
      if (err.message !== 'Unauthorized') {
        Toast.show('error', '请求失败', err.message);
      }
      throw err;
    }
  },

  get:    (url, data) => API.request('GET',    url, data),
  post:   (url, data) => API.request('POST',   url, data),
  put:    (url, data) => API.request('PUT',    url, data),
  patch:  (url, data) => API.request('PATCH',  url, data),
  delete: (url, data) => API.request('DELETE', url, data),
};

/* ═══════════════════════════════════════════════════════════
   Toast Notification System
   ═══════════════════════════════════════════════════════════ */
const Toast = {
  container: null,

  init() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.id = 'toast-container';
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(this.container);
  },

  show(type, title, message = '', duration = 4000) {
    this.init();
    const icons = {
      success: '✓',
      error:   '✕',
      warning: '⚠',
      info:    'ℹ',
    };

    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.id = toastId;
    // role="alert" for errors (high priority), role="status" for others
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${icons[type] || 'ℹ'}</span>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="关闭通知" onclick="Toast.dismiss(this.parentElement)">✕</button>
    `;

    this.container.appendChild(toast);

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }

    return toast;
  },

  dismiss(toast) {
    if (!toast || !toast.parentElement) return;
    toast.classList.add('toast-out');
    toast.setAttribute('aria-hidden', 'true');
    setTimeout(() => toast.remove(), 200);
  },

  success(title, message) { return this.show('success', title, message); },
  error(title, message)   { return this.show('error',   title, message); },
  warning(title, message)  { return this.show('warning', title, message); },
  info(title, message)     { return this.show('info',    title, message); },
};

/* ═══════════════════════════════════════════════════════════
   Modal System
   ═══════════════════════════════════════════════════════════ */
const Modal = {
  active: null,
  previousFocus: null,

  show(options = {}) {
    const {
      title     = '',
      content   = '',
      size      = 'md',    // sm / md / lg / xl
      closable  = true,
      onClose   = null,
      footer    = null,    // HTML string or null for default
      showClose = true,
    } = options;

    // Save current focus for restoration on close
    this.previousFocus = document.activeElement;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.dataset.closable = closable;

    const modalId = 'modal-' + Date.now();
    const titleId = 'modal-title-' + Date.now();

    const modalEl = document.createElement('div');
    modalEl.className = `modal modal-${size}`;
    modalEl.id = modalId;
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.setAttribute('aria-labelledby', titleId);
    modalEl.setAttribute('tabindex', '-1');
    modalEl.innerHTML = `
      ${title ? `
        <div class="modal-header">
          <div class="modal-title" id="${titleId}">${title}</div>
          ${showClose ? `<button class="modal-close" id="modal-close-btn" aria-label="关闭对话框">✕</button>` : ''}
        </div>
      ` : ''}
      <div class="modal-body">${content}</div>
      ${footer !== undefined ? `
        <div class="modal-footer">${footer || ''}</div>
      ` : ''}
    `;

    overlay.appendChild(modalEl);
    document.body.appendChild(overlay);

    // Trigger animation
    requestAnimationFrame(() => overlay.classList.add('show'));

    // Event bindings
    if (closable) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.id === 'modal-close-btn') {
          this.hide(overlay, onClose);
        }
      });
    }

    if (showClose) {
      const closeBtn = modalEl.querySelector('#modal-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', () => this.hide(overlay, onClose));
    }

    // Keyboard: Escape to close
    const keyHandler = (e) => {
      if (e.key === 'Escape' && closable) {
        this.hide(overlay, onClose);
        document.removeEventListener('keydown', keyHandler);
      }
      // Focus trap
      if (e.key === 'Tab') {
        const focusable = modalEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', keyHandler);
    overlay._keyHandler = keyHandler;

    this.active = overlay;
    modalEl._overlay = overlay;

    // Focus first focusable element in modal
    setTimeout(() => {
      const firstFocusable = modalEl.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) firstFocusable.focus();
    }, 50);

    return modalEl;
  },

  hide(overlay, onClose) {
    if (!overlay) overlay = this.active;
    if (!overlay) return;

    // Remove keyboard handler
    if (overlay._keyHandler) {
      document.removeEventListener('keydown', overlay._keyHandler);
    }

    overlay.classList.remove('show');
    setTimeout(() => {
      overlay.remove();
      if (this.active === overlay) this.active = null;
      // Restore focus to previously focused element
      if (this.previousFocus && this.previousFocus.focus) {
        this.previousFocus.focus();
        this.previousFocus = null;
      }
      if (typeof onClose === 'function') onClose();
    }, 200);
  },

  confirm(options = {}) {
    return new Promise((resolve) => {
      const {
        title     = '确认操作',
        message   = '确定要执行此操作吗？',
        confirmText = '确定',
        cancelText  = '取消',
        danger  = false,
      } = options;

      const footerHTML = `
        <button class="btn btn-secondary" id="modal-cancel-btn">${cancelText}</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="modal-confirm-btn">${confirmText}</button>
      `;

      const modalEl = this.show({
        title,
        content: `<p style="color:var(--color-slate-600);font-size:var(--text-sm);line-height:1.6">${message}</p>`,
        size: 'sm',
        footer: footerHTML,
        closable: false,
        showClose: false,
      });

      modalEl.querySelector('#modal-confirm-btn').addEventListener('click', () => {
        this.hide(modalEl._overlay);
        resolve(true);
      });

      modalEl.querySelector('#modal-cancel-btn').addEventListener('click', () => {
        this.hide(modalEl._overlay);
        resolve(false);
      });
    });
  },

  alert(options = {}) {
    const { title = '提示', message = '', confirmText = '我知道了' } = options;
    return new Promise((resolve) => {
      const modalEl = this.show({
        title,
        content: `<p style="color:var(--color-slate-600);font-size:var(--text-sm);line-height:1.6">${message}</p>`,
        size: 'sm',
        footer: `<button class="btn btn-primary" id="modal-ok-btn" style="width:100%">${confirmText}</button>`,
        closable: false,
        showClose: false,
      });

      modalEl.querySelector('#modal-ok-btn').addEventListener('click', () => {
        this.hide(modalEl._overlay);
        resolve();
      });
    });
  },
};

/* ═══════════════════════════════════════════════════════════
   Drawer System
   ═══════════════════════════════════════════════════════════ */
const Drawer = {
  active: null,
  previousFocus: null,

  show(options = {}) {
    const {
      title    = '',
      content  = '',
      width    = '480px',
      onClose  = null,
    } = options;

    // Save current focus for restoration on close
    this.previousFocus = document.activeElement;

    const overlay = document.createElement('div');
    overlay.className = 'drawer-overlay';

    const drawerId = 'drawer-' + Date.now();
    const titleId = 'drawer-title-' + Date.now();

    const drawerEl = document.createElement('div');
    drawerEl.className = 'drawer';
    drawerEl.id = drawerId;
    drawerEl.style.width = width;
    drawerEl.setAttribute('role', 'dialog');
    drawerEl.setAttribute('aria-modal', 'true');
    drawerEl.setAttribute('aria-labelledby', titleId);
    drawerEl.setAttribute('tabindex', '-1');
    drawerEl.innerHTML = `
      <div class="drawer-header">
        <div class="drawer-title" id="${titleId}">${title}</div>
        <button class="modal-close" id="drawer-close-btn" aria-label="关闭面板">✕</button>
      </div>
      <div class="drawer-body">${content}</div>
      <div class="drawer-footer" id="drawer-footer"></div>
    `;

    overlay.appendChild(drawerEl);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('show'));

    const keyHandler = (e) => {
      if (e.key === 'Escape') {
        this.hide(overlay, onClose);
        document.removeEventListener('keydown', keyHandler);
      }
      if (e.key === 'Tab') {
        const focusable = drawerEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', keyHandler);
    overlay._keyHandler = keyHandler;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.id === 'drawer-close-btn') {
        this.hide(overlay, onClose);
      }
    });

    this.active = overlay;
    drawerEl._overlay = overlay;

    // Focus first focusable element
    setTimeout(() => {
      const firstFocusable = drawerEl.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) firstFocusable.focus();
    }, 50);

    return drawerEl;
  },

  hide(overlay, onClose) {
    if (!overlay) overlay = this.active;
    if (!overlay) return;

    if (overlay._keyHandler) {
      document.removeEventListener('keydown', overlay._keyHandler);
    }

    overlay.classList.remove('show');
    setTimeout(() => {
      overlay.remove();
      if (this.active === overlay) this.active = null;
      if (this.previousFocus && this.previousFocus.focus) {
        this.previousFocus.focus();
        this.previousFocus = null;
      }
      if (typeof onClose === 'function') onClose();
    }, 300);
  },

  setFooter(footerHTML) {
    if (!this.active) return;
    const footer = this.active.querySelector('.drawer').querySelector('#drawer-footer');
    if (footer) footer.innerHTML = footerHTML;
  },

  setContent(content) {
    if (!this.active) return;
    const body = this.active.querySelector('.drawer').querySelector('.drawer-body');
    if (body) body.innerHTML = content;
  },
};

/* ═══════════════════════════════════════════════════════════
   Sidebar
   ═══════════════════════════════════════════════════════════ */
const Sidebar = {
  init() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');

    if (toggleBtn) {
      // Set initial aria-expanded state
      const updateAriaExpanded = () => {
        const isMobile = window.innerWidth <= 1024;
        if (isMobile) {
          toggleBtn.setAttribute('aria-expanded', sidebar.classList.contains('mobile-open') ? 'true' : 'false');
          toggleBtn.setAttribute('aria-label', sidebar.classList.contains('mobile-open') ? '关闭导航菜单' : '打开导航菜单');
        } else {
          toggleBtn.setAttribute('aria-expanded', sidebar.classList.contains('collapsed') ? 'false' : 'true');
          toggleBtn.setAttribute('aria-label', sidebar.classList.contains('collapsed') ? '展开侧边栏' : '收起侧边栏');
        }
      };
      updateAriaExpanded();

      toggleBtn.addEventListener('click', () => {
        const isMobile = window.innerWidth <= 1024;
        if (isMobile) {
          sidebar.classList.toggle('mobile-open');
          let overlay = document.querySelector('.sidebar-overlay');
          if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.setAttribute('aria-hidden', 'true');
            document.body.appendChild(overlay);
            overlay.addEventListener('click', () => {
              sidebar.classList.remove('mobile-open');
              overlay.classList.remove('show');
              toggleBtn.setAttribute('aria-expanded', 'false');
            });
          }
          if (sidebar.classList.contains('mobile-open')) {
            overlay.classList.add('show');
          } else {
            overlay.classList.remove('show');
          }
        } else {
          sidebar.classList.toggle('collapsed');
          document.querySelector('.main-content')?.classList.toggle('sidebar-collapsed');
        }
        updateAriaExpanded();
      });

      // Update on window resize
      window.addEventListener('resize', () => {
        if (!sidebar.classList.contains('mobile-open')) {
          updateAriaExpanded();
        }
      });
    }

    // Active nav detection with aria-current
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(item => {
      const href = item.getAttribute('href');
      if (href && currentPath.endsWith(href)) {
        item.classList.add('active');
        item.setAttribute('aria-current', 'page');
      }
    });
  },
};

/* ═══════════════════════════════════════════════════════════
   Tabs
   ═══════════════════════════════════════════════════════════ */
function initTabs(container) {
  const tabContainer = typeof container === 'string' ? document.querySelector(container) : container;
  if (!tabContainer) return;

  const tabs   = tabContainer.querySelectorAll('.tab-item');
  const panes  = tabContainer.querySelectorAll('.tab-content');

  // Set up ARIA roles
  tabContainer.setAttribute('role', 'tablist');
  tabs.forEach((tab, idx) => {
    const paneId = tab.dataset.tab;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
    tab.setAttribute('aria-controls', paneId);
    tab.setAttribute('id', 'tab-' + paneId);
    tab.setAttribute('tabindex', tab.classList.contains('active') ? '0' : '-1');
  });
  panes.forEach(pane => {
    pane.setAttribute('role', 'tabpanel');
    pane.setAttribute('aria-labelledby', 'tab-' + pane.dataset.tab);
    pane.setAttribute('tabindex', '0');
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      tab.setAttribute('tabindex', '0');
      const pane = tabContainer.querySelector(`.tab-content[data-tab="${target}"]`);
      if (pane) pane.classList.add('active');
    });

    // Keyboard navigation
    tab.addEventListener('keydown', (e) => {
      const tabList = Array.from(tabs);
      const currentIdx = tabList.indexOf(tab);
      let newIdx = currentIdx;

      if (e.key === 'ArrowRight') {
        newIdx = (currentIdx + 1) % tabList.length;
      } else if (e.key === 'ArrowLeft') {
        newIdx = (currentIdx - 1 + tabList.length) % tabList.length;
      } else if (e.key === 'Home') {
        newIdx = 0;
      } else if (e.key === 'End') {
        newIdx = tabList.length - 1;
      } else {
        return;
      }

      e.preventDefault();
      tabList[newIdx].click();
      tabList[newIdx].focus();
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   Pagination
   ═══════════════════════════════════════════════════════════ */
class Pagination {
  constructor(options = {}) {
    this.container   = options.container;
    this.currentPage = options.initialPage || 1;
    this.total       = options.total || 0;
    this.limit       = options.limit || 10;
    this.onChange    = options.onChange || (() => {});

    this.render();
  }

  get totalPages() { return Math.ceil(this.total / this.limit) || 1; }

  setTotal(total) {
    this.total = total;
    this.render();
  }

  render() {
    if (!this.container) return;
    const start = (this.currentPage - 1) * this.limit + 1;
    const end   = Math.min(this.currentPage * this.limit, this.total);

    this.container.innerHTML = `
      <div class="pagination-info">
        显示 ${this.total > 0 ? start : 0}–${end} 条，共 ${this.total} 条
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn" id="page-prev" ${this.currentPage <= 1 ? 'disabled' : ''}>‹</button>
        ${this._buildPageNumbers()}
        <button class="pagination-btn" id="page-next" ${this.currentPage >= this.totalPages ? 'disabled' : ''}>›</button>
      </div>
    `;

    this.container.querySelector('#page-prev')?.addEventListener('click', () => this.go(this.currentPage - 1));
    this.container.querySelector('#page-next')?.addEventListener('click', () => this.go(this.currentPage + 1));
  }

  _buildPageNumbers() {
    const pages = [];
    const total = this.totalPages;
    const cur   = this.currentPage;
    const delta = 2;

    let left  = Math.max(1, cur - delta);
    let right = Math.min(total, cur + delta);

    if (left > 1) { pages.push(1); if (left > 2) pages.push('...'); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total) { if (right < total - 1) pages.push('...'); pages.push(total); }

    return pages.map(p => {
      if (p === '...') return `<span class="pagination-btn" style="cursor:default;border:none">…</span>`;
      const active = p === cur ? 'active' : '';
      return `<button class="pagination-btn ${active}" data-page="${p}">${p}</button>`;
    }).join('');
  }

  go(page) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.render();
    this.onChange(page);
  }

  reset() {
    this.currentPage = 1;
    this.render();
  }
}

/* ═══════════════════════════════════════════════════════════
   DataTable
   ═══════════════════════════════════════════════════════════ */
class DataTable {
  constructor(options = {}) {
    this.container   = options.container;
    this.columns     = options.columns || [];
    this.data        = options.data || [];
    this.actions     = options.actions || [];
    this.selectable  = options.selectable || false;
    this.onSelectionChange = options.onSelectionChange || (() => {});
    this.emptyText   = options.emptyText || '暂无数据';
    this.render();
  }

  setData(data) {
    this.data = data;
    this.render();
  }

  render() {
    if (!this.container) return;

    const hasData = this.data && this.data.length > 0;

    let html = '<div class="table-wrapper"><table class="table">';

    // Thead
    html += '<thead><tr>';
    if (this.selectable) {
      html += `<th style="width:40px"><input type="checkbox" id="select-all"></th>`;
    }
    this.columns.forEach(col => {
      const style = col.width ? `style="width:${col.width}"` : '';
      html += `<th ${style}>${col.label}</th>`;
    });
    if (this.actions.length) html += `<th style="width:140px">操作</th>`;
    html += '</tr></thead>';

    // Tbody
    html += '<tbody>';
    if (hasData) {
      this.data.forEach((row, idx) => {
        html += '<tr>';
        if (this.selectable) {
          html += `<td><input type="checkbox" class="row-check" data-idx="${idx}"></td>`;
        }
        this.columns.forEach(col => {
          const val = typeof col.render === 'function' ? col.render(row[col.key], row) : (row[col.key] ?? '—');
          html += `<td>${val}</td>`;
        });
        if (this.actions.length) {
          html += '<td><div class="table-actions">';
          this.actions.forEach(action => {
            const disabled = typeof action.disabled === 'function' ? action.disabled(row) : action.disabled;
            html += `
              <button class="btn btn-ghost btn-sm ${action.class || ''}"
                      data-action="${action.key}"
                      ${disabled ? 'disabled style="opacity:0.4;cursor:not-allowed"' : ''}>
                ${action.label}
              </button>`;
          });
          html += '</div></td>';
        }
        html += '</tr>';
      });
    } else {
      const colCount = this.columns.length + (this.selectable ? 1 : 0) + (this.actions.length ? 1 : 0);
      html += `
        <tr>
          <td colspan="${colCount}">
            <div class="empty-state">
              <div class="empty-icon">📭</div>
              <div class="empty-title">${this.emptyText}</div>
            </div>
          </td>
        </tr>`;
    }
    html += '</tbody></table></div>';

    // Pagination
    html += `
      <div class="pagination" id="${this.container.id}-pagination">
        <div class="pagination-info">显示 0 条，共 0 条</div>
        <div class="pagination-controls"></div>
      </div>`;

    this.container.innerHTML = html;

    // Select all
    if (this.selectable) {
      this.container.querySelector('#select-all')?.addEventListener('change', (e) => {
        this.container.querySelectorAll('.row-check').forEach(cb => cb.checked = e.target.checked);
        this._emitSelection();
      });
      this.container.querySelectorAll('.row-check').forEach(cb => {
        cb.addEventListener('change', () => this._emitSelection());
      });
    }

    // Row actions
    if (this.actions.length) {
      this.container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const rowIdx = parseInt(e.target.closest('tr').querySelector('.row-check')?.dataset.idx ?? e.target.closest('tr').rowIndex - 1);
          const actionKey = e.target.dataset.action;
          const action = this.actions.find(a => a.key === actionKey);
          if (action && typeof action.onClick === 'function') {
            action.onClick(this.data[rowIdx], rowIdx);
          }
        });
      });
    }
  }

  _emitSelection() {
    const checked = [...this.container.querySelectorAll('.row-check:checked')].map(cb => parseInt(cb.dataset.idx));
    this.onSelectionChange(checked.map(i => this.data[i]));
  }
}

/* ═══════════════════════════════════════════════════════════
   Format Utilities
   ═══════════════════════════════════════════════════════════ */
const Fmt = {
  date(date, fmt = 'YYYY-MM-DD HH:mm') {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d)) return '—';
    const map = {
      YYYY: d.getFullYear(),
      MM:   String(d.getMonth() + 1).padStart(2, '0'),
      DD:   String(d.getDate()).padStart(2, '0'),
      HH:   String(d.getHours()).padStart(2, '0'),
      mm:   String(d.getMinutes()).padStart(2, '0'),
      ss:   String(d.getSeconds()).padStart(2, '0'),
    };
    return fmt.replace(/YYYY|MM|DD|HH|mm|ss/g, m => map[m]);
  },

  number(n, decimals = 0) {
    if (n == null) return '—';
    return Number(n).toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  },

  percent(a, b, decimals = 0) {
    if (!b) return '—';
    return (a / b * 100).toFixed(decimals) + '%';
  },

  truncate(str, len = 20) {
    if (!str) return '—';
    return str.length > len ? str.slice(0, len) + '…' : str;
  },
};

/* ═══════════════════════════════════════════════════════════
   Init on DOM Ready
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  Sidebar.init();
});

/* ═══════════════════════════════════════════════════════════
   Auth Guard — 教师页面权限验证
   ═══════════════════════════════════════════════════════════ */
function checkAuth() {
  const token = localStorage.getItem('yw_token');
  if (!token || token.length < 10) {
    // 未登录，跳转到登录页
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem('yw_token');
  localStorage.removeItem('yw_admin');
  window.location.href = 'login.html';
}

/* ═══════════════════════════════════════════════════════════
   Export
   ═══════════════════════════════════════════════════════════ */
window.API     = API;
window.Toast   = Toast;
window.Modal   = Modal;
window.Drawer  = Drawer;
window.Fmt     = Fmt;
window.DataTable = DataTable;
window.Pagination = Pagination;
window.initTabs    = initTabs;
window.checkAuth   = checkAuth;
window.logout      = logout;

