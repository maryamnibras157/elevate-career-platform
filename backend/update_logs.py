import os
import glob

# Find all python files in backend/app/admin
backend_dir = os.path.join(os.path.dirname(__file__), 'app', 'admin')
python_files = glob.glob(f"{backend_dir}/**/*.py", recursive=True)

for file in python_files:
    if file.endswith('audit.py') and 'core' in file:
        continue # skip the definition file
        
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'log_admin_event(' in content:
        # We replace log_admin_event( with await log_admin_event(
        # Note: Need to make sure it doesn't already have await
        content = content.replace('await log_admin_event(', 'log_admin_event(') # remove existing just in case
        content = content.replace('log_admin_event(', 'await log_admin_event(')
        # Also need to fix imports if they are messed up? No, import is `from ... import log_admin_event`
        # which will be `from ... import await log_admin_event`. That is bad.
        # Let's fix the import statement:
        content = content.replace('from app.admin.core.audit import await log_admin_event', 'from app.admin.core.audit import log_admin_event')
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
