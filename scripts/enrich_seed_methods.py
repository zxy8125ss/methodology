import re

seed_path = '/Users/doss/.gemini/antigravity/scratch/methodology/src/data/seedMethods.ts'
with open(seed_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update method_feynman aliases to include '费曼技巧', '费曼'
content = content.replace(
    "aliases: ['Feynman Technique', '以教促学'],",
    "aliases: ['Feynman Technique', '费曼技巧', '费曼', '以教促学'],"
)

# Update method_okr aliases to include 'OKR', '目标管理'
content = content.replace(
    "aliases: ['Objectives and Key Results', '目标与关键结果法'],",
    "aliases: ['Objectives and Key Results', 'OKR', '目标与关键结果法', '目标管理'],"
)

# Update method_pdca aliases to include 'PDCA'
content = content.replace(
    "aliases: ['戴明环', '质量环', 'Plan-Do-Check-Act'],",
    "aliases: ['戴明环', '质量环', 'Plan-Do-Check-Act', 'PDCA', 'PDCA循环'],"
)

# Update method_first_principles aliases
content = content.replace(
    "aliases: ['First Principles Thinking', '第一原理思考'],",
    "aliases: ['First Principles Thinking', '第一性原理', '第一原理思考', '第一性原理思维', '第一性'],"
)

# Update method_eisenhower aliases
content = content.replace(
    "aliases: ['时间管理四象限', 'Eisenhower Matrix', '紧急与重要矩阵'],",
    "aliases: ['时间管理四象限', 'Eisenhower Matrix', '紧急与重要矩阵', '四象限法则', '四象限'],"
)

with open(seed_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated aliases successfully in seedMethods.ts!")
