import os
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext

# --- CONFIGURATION ---
# Folders to completely ignore from the GUI list (Standard noise)
IGNORE_DIRS = {'.git', 'node_modules', '__pycache__', '.next', 'venv', 'dist', 'build', '.idea', '.vscode'}

class ProjectMapperApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Project Structure Generator Tool")
        self.root.geometry("900x600")
        
        # Apply a cleaner theme
        style = ttk.Style()
        style.theme_use('clam') # 'clam', 'alt', 'default', 'classic'

        # Current working directory
        self.base_path = os.getcwd()
        self.folder_vars = {} 

        # --- MAIN LAYOUT (Split Screen) ---
        # We use a PanedWindow to allow resizing left/right areas
        self.paned_window = ttk.PanedWindow(root, orient=tk.HORIZONTAL)
        self.paned_window.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # LEFT PANEL: Folder Selection
        self.left_frame = ttk.LabelFrame(self.paned_window, text=" 1. Select Folders ", padding=(10, 5))
        self.paned_window.add(self.left_frame, weight=1)

        # RIGHT PANEL: Output
        self.right_frame = ttk.LabelFrame(self.paned_window, text=" 2. Generated Tree ", padding=(10, 5))
        self.paned_window.add(self.right_frame, weight=2)

        # --- LEFT PANEL CONTENT ---
        # Select/Deselect Buttons
        btn_frame = ttk.Frame(self.left_frame)
        btn_frame.pack(fill="x", pady=(0, 5))
        ttk.Button(btn_frame, text="All", width=6, command=self.select_all).pack(side="left", padx=2)
        ttk.Button(btn_frame, text="None", width=6, command=self.deselect_all).pack(side="left", padx=2)
        ttk.Button(btn_frame, text="Refresh", width=8, command=self.refresh_list).pack(side="right", padx=2)

        # Scrollable Canvas for Checkboxes
        self.canvas = tk.Canvas(self.left_frame, bg="white", highlightthickness=0)
        self.scrollbar = ttk.Scrollbar(self.left_frame, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = ttk.Frame(self.canvas)

        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )

        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=self.scrollbar.set)

        self.canvas.pack(side="left", fill="both", expand=True)
        self.scrollbar.pack(side="right", fill="y")

        # --- RIGHT PANEL CONTENT ---
        # Text Area with Monospace font (Crucial for tree alignment)
        self.output_text = scrolledtext.ScrolledText(self.right_frame, height=10, font=("Consolas", 10))
        self.output_text.pack(fill="both", expand=True, padx=5, pady=5)

        # Action Buttons Area (Bottom of Right Panel)
        action_frame = ttk.Frame(self.right_frame)
        action_frame.pack(fill="x", pady=5)

        # Generate Button
        self.gen_btn = tk.Button(action_frame, text="Generate Tree", bg="#4CAF50", fg="white", 
                                 font=("Segoe UI", 10, "bold"), command=self.generate_structure, padx=20, pady=5, relief="flat")
        self.gen_btn.pack(side="left", padx=5)

        # Copy Button
        self.copy_btn = tk.Button(action_frame, text="Copy to Clipboard", bg="#2196F3", fg="white", 
                                  font=("Segoe UI", 10, "bold"), command=self.copy_to_clipboard, padx=20, pady=5, relief="flat")
        self.copy_btn.pack(side="left", padx=5)

        # Status Label
        self.status_var = tk.StringVar()
        self.status_var.set(f"Scanning: {os.path.basename(self.base_path)}")
        self.status_lbl = ttk.Label(root, textvariable=self.status_var, relief=tk.SUNKEN, anchor="w")
        self.status_lbl.pack(side=tk.BOTTOM, fill=tk.X)

        # --- INITIALIZATION ---
        self.populate_folders()

    def refresh_list(self):
        """Clears and re-scans the directory."""
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()
        self.folder_vars = {}
        self.populate_folders()

    def populate_folders(self):
        """Scans the directory and creates a checkbox for every subfolder."""
        sorted_dirs = []
        for root, dirs, files in os.walk(self.base_path):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            for d in dirs:
                full_path = os.path.join(root, d)
                rel_path = os.path.relpath(full_path, self.base_path)
                sorted_dirs.append(rel_path)
        
        sorted_dirs.sort()

        if not sorted_dirs:
            ttk.Label(self.scrollable_frame, text="No subfolders found.").pack(padx=5, pady=5)
            self.status_var.set("Ready (No subfolders found)")
            return

        for rel_path in sorted_dirs:
            var = tk.BooleanVar(value=False)
            self.folder_vars[rel_path] = var
            
            # Indent logic
            depth = rel_path.count(os.sep)
            indent_space = "    " * depth
            
            # Note: We use a Frame to hold the checkbox to ensure alignment
            row_frame = ttk.Frame(self.scrollable_frame)
            row_frame.pack(fill="x", anchor="w")
            
            cb = tk.Checkbutton(row_frame, text=f"{rel_path}", variable=var, anchor="w", bg="white", borderwidth=0)
            # Add padding to the left to simulate tree hierarchy in the checklist
            cb.pack(fill="x", anchor="w", padx=(depth * 20, 0))

        self.status_var.set(f"Ready. Found {len(sorted_dirs)} folders.")

    def select_all(self):
        for var in self.folder_vars.values():
            var.set(True)

    def deselect_all(self):
        for var in self.folder_vars.values():
            var.set(False)

    def generate_structure(self):
        tree_lines = []
        tree_lines.append(f"{os.path.basename(self.base_path)}/") 
        
        selected_rel_paths = {path for path, var in self.folder_vars.items() if var.get()}

        for root, dirs, files in os.walk(self.base_path):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            dirs.sort() # Ensure alphabetical order
            files.sort()

            rel_root = os.path.relpath(root, self.base_path)
            
            if rel_root == ".":
                level = 0
            else:
                level = rel_root.count(os.sep) + 1

            indent = "│   " * level
            
            # If folder is NOT selected and NOT root, skip its files
            if rel_root != "." and rel_root not in selected_rel_paths:
                continue

            # Add Files
            for i, f in enumerate(files):
                connector = "├── "
                tree_lines.append(f"{indent}{connector}{f}")

            # Add Subdirectories (Markers)
            for i, d in enumerate(dirs):
                sub_rel_path = os.path.join(rel_root, d).replace("./", "")
                if rel_root == ".": sub_rel_path = d
                
                status = " (Collapsed)" if sub_rel_path not in selected_rel_paths else ""
                
                connector = "├── "
                tree_lines.append(f"{indent}{connector}📂 {d}/{status}")

        result = "\n".join(tree_lines)
        self.output_text.delete(1.0, tk.END)
        self.output_text.insert(tk.END, result)
        self.status_var.set("Structure Generated successfully.")

    def copy_to_clipboard(self):
        content = self.output_text.get("1.0", tk.END).strip()
        if not content:
            messagebox.showwarning("Empty", "Nothing to copy! Generate the tree first.")
            return
            
        self.root.clipboard_clear()
        self.root.clipboard_append(content)
        self.root.update() # Keeps clipboard available even if app closes immediately
        
        self.status_var.set("✅ Copied to clipboard!")
        
        # visual feedback on button
        original_text = self.copy_btn['text']
        self.copy_btn.configure(text="Copied!", bg="#1976D2")
        self.root.after(1500, lambda: self.copy_btn.configure(text=original_text, bg="#2196F3"))

if __name__ == "__main__":
    root = tk.Tk()
    app = ProjectMapperApp(root)
    root.mainloop()