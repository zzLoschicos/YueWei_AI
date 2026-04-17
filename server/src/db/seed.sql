-- 阅微 AI 诊断系统 · 初始数据
-- 管理员账号：admin / admin123

-- 插入管理员
INSERT OR IGNORE INTO teachers (username, password, name, role) VALUES
('admin', '$2a$10$rQXKQqK.qL.6LqFqJQJqJ.qL.6LqFqJQJqJ.qL.6LqFqJQJqJ.qL.', '张明远', '语文教研组');

-- 插入示例题目
INSERT OR IGNORE INTO questions (title, type, difficulty, content, answer_template, scoring_rules) VALUES
('《静夜思》赏析', 'poetry', 'easy',
'阅读下面的诗歌，回答问题。\n\n《静夜思》\n李白\n床前明月光，\n疑是地上霜。\n举头望明月，\n低头思故乡。\n\n请分析这首诗的意象、情感和艺术特色。',
'这首诗表达了诗人对故乡的深切思念之情...',
'[{"item":"意象分析","max_score":30},{"item":"情感理解","max_score":30},{"item":"艺术特色","max_score":40}]'),

('《登鹳雀楼》赏析', 'poetry', 'medium',
'阅读下面的诗歌，回答问题。\n\n《登鹳雀楼》\n王之涣\n白日依山尽，\n黄河入海流。\n欲穷千里目，\n更上一层楼。\n\n请分析这首诗的意境与哲理。',
'这首诗意境开阔，蕴含着积极向上的哲理...',
'[{"item":"意境分析","max_score":30},{"item":"哲理概括","max_score":40},{"item":"艺术手法","max_score":30}]'),

('现代文阅读理解', 'modern', 'medium',
'阅读下面的文章，回答问题。\n\n[现代文阅读材料]\n\n1. 文章的主题是什么？\n2. 请分析文章使用的修辞手法及其作用。\n3. 谈谈你对文章结尾的理解。',
'这篇文章通过...表达了...',
'[{"item":"主题概括","max_score":25},{"item":"修辞分析","max_score":35},{"item":"内容理解","max_score":40}]');

-- 插入方法论标准
INSERT OR IGNORE INTO methodology (name, description, content, enabled) VALUES
('诗歌鉴赏标准', '高中语文诗歌鉴赏评分标准', '{"dimension":"意象","weight":0.3,"description":"是否准确识别并分析诗歌意象"},{"dimension":"情感","weight":0.3,"description":"是否准确把握诗人情感"},{"dimension":"表达","weight":0.2,"description":"语言表达准确流畅"},{"dimension":"创意","weight":0.2,"description":"是否有独到见解"}', 1),
('现代文阅读标准', '现代文阅读理解评分标准', '{"dimension":"内容","weight":0.4,"description":"是否准确理解文章内容"},{"dimension":"手法","weight":0.3,"description":"修辞手法分析是否准确"},{"dimension":"理解","weight":0.3,"description":"深层含义理解"}', 1);
