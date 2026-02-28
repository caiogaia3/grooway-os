import re

with open("skills_engine/skills/agent_05_rastreador_leads/skill_tracking.py", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if i >= 197 and i <= 301:
        if i == 197:
            new_lines.append(line) # score = report["score"]
        elif i >= 198 and i <= 296:
            # unindent by 4 spaces
            if line.startswith("    "):
                new_lines.append(line[4:])
            else:
                new_lines.append(line)
        elif i >= 297 and i <= 301:
            # the try block exception. Let's just remove this completely because there's no try block!
            pass
    else:
        new_lines.append(line)

with open("skills_engine/skills/agent_05_rastreador_leads/skill_tracking.py", "w") as f:
    f.writelines(new_lines)
