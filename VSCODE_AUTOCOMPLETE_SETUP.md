# k6-cucumber-steps: VSCode Autocomplete Setup Guide

## 🤔 Why Autocomplete Might Not Work

The Cucumber (Gherkin) Full Support extension needs **3 things** to provide autocomplete:

1. ✅ **Step definitions** (you have 69!)
2. ✅ **metadata.json** (generated in dist/)
3. ❌ **VSCode configuration** (this is usually missing!)

---

## ✅ Solution: Configure VSCode

### Step 1: Install the Right Extension

Make sure you have **one** of these extensions installed:

- **Cucumber (Gherkin) Full Support** by Alexander Krechik (Recommended)
- **Cucumber** by Rolf Rander

❌ Don't install both - they conflict!

### Step 2: Create `.vscode/settings.json`

In your **project root** (where you run k6-cucumber-steps), create:

```json
{
  "cucumber.features": [
    "features/**/*.feature"
  ],
  "cucumber.stepDefinitions": [
    "steps/**/*.ts",
    "steps/**/*.js"
  ],
  "cucumber.autocomplete.snippets": true
}
```

### Step 3: Reload VSCode

Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows) → Type "Reload Window"

### Step 4: Test Autocomplete

Open a `.feature` file and type:
- `Given ` (with space)
- `When ` (with space)
- `Then ` (with space)

You should see a dropdown with all 69 step definitions!

---

## 🔧 Troubleshooting

### Issue: Still no autocomplete

**Fix 1: Check Extension Settings**

1. Go to VSCode Settings (`Cmd+,` or `Ctrl+,`)
2. Search for "cucumber"
3. Ensure these are checked:
   - ✅ Cucumber > Autocomplete > Snippets
   - ✅ Cucumber > Format > Enable

**Fix 2: Verify metadata.json exists**

```bash
# Check if metadata.json exists
ls dist/metadata.json

# If missing, rebuild
npm run build
```

**Fix 3: Check file paths**

Make sure your `.vscode/settings.json` paths match your actual structure:

```json
{
  "cucumber.features": [
    "features/**/*.feature"  // ✅ Change if your features are elsewhere
  ],
  "cucumber.stepDefinitions": [
    "steps/**/*.ts",         // ✅ Change if your steps are elsewhere
    "steps/**/*.js"
  ]
}
```

**Fix 4: Restart Language Server**

Press `Cmd+Shift+P` → Type "Developer: Restart Language Server"

---

## 📦 For npm Package Users

If you're using k6-cucumber-steps from npm (not developing it), the setup is slightly different:

### In Your Project Root

Create `.vscode/settings.json`:

```json
{
  "cucumber.features": [
    "features/**/*.feature"
  ],
  "cucumber.stepDefinitions": [
    "steps/**/*.ts",
    "steps/**/*.js"
  ],
  "cucumber.autocomplete.snippets": true,
  // Point to the installed package metadata
  "cucumber.metadataPaths": [
    "./node_modules/k6-cucumber-steps/dist/metadata.json"
  ]
}
```

### Verify Installation

```bash
# Check if package is installed
ls node_modules/k6-cucumber-steps/dist/metadata.json

# If missing, reinstall
npm install k6-cucumber-steps
```

---

## 🎯 Expected Behavior

When autocomplete works, you'll see:

```
Given | When | Then
  ↓
[Dropdown appears]
  ├─ the k6 base URL is {string}
  ├─ I k6 make a GET request to {string}
  ├─ I k6 make a POST request to {string}
  ├─ the k6 response status should be {string}
  └─ ... (65 more)
```

Each suggestion shows:
- ✅ Step pattern
- ✅ Description
- ✅ Category (HTTP, Browser, Assertions, etc.)

---

## 🚀 Pro Tips

### 1. Use Snippet Placeholders

When you select a step, VSCode auto-jumps to placeholders:

```gherkin
When I k6 make a GET request to "|cursor|"
                                              ↑
                                   Press Tab to fill this
```

### 2. Filter by Category

Type part of the step to filter:

```
Type: "DELETE" → Shows only DELETE steps
Type: "alias" → Shows only alias-related steps
```

### 3. Quick Fix for Missing Steps

If a step isn't found:
1. Right-click the red squiggly line
2. Select "Create Step Definition"
3. VSCode creates a stub function

---

## 📝 Still Not Working?

Try these nuclear options:

### Option 1: Delete and Reinstall Extension

```bash
# In VSCode
1. Go to Extensions (Cmd+Shift+X)
2. Find "Cucumber"
3. Click "Uninstall"
4. Reload VSCode
5. Reinstall the extension
```

### Option 2: Clear VSCode Cache

```bash
# Close VSCode completely
# Delete cache folder
rm -rf ~/Library/Application\ Support/Code/Cache/*

# Reopen VSCode
```

### Option 3: Check Extension Conflicts

Disable these extensions (they can conflict):
- ❌ Gherkin Autocomplete
- ❌ Cucumber.js
- ❌ Any other Cucumber extensions

Keep only **ONE** Cucumber extension active!

---

## ✅ Verification Checklist

- [ ] Cucumber extension installed
- [ ] `.vscode/settings.json` created
- [ ] `dist/metadata.json` exists (or `node_modules/k6-cucumber-steps/dist/metadata.json`)
- [ ] VSCode reloaded
- [ ] `.feature` file open
- [ ] Typed `Given `, `When `, or `Then ` (with space)
- [ ] Dropdown appears with 69 steps

If all checkboxes are ✅ and it still doesn't work, please open an issue on GitHub with:
- VSCode version
- Extension version
- Screenshot of the issue
- Your `.vscode/settings.json` (remove sensitive paths)

---

**GitHub Issues:** https://github.com/qaPaschalE/k6-cucumber-steps/issues
