#!/usr/bin/env python3
import os
import shutil
import sys

def delete_directory(path):
    """Delete a directory and all its contents."""
    if not os.path.exists(path):
        print(f"✓ Directory does not exist: {path}")
        return True
    
    try:
        print(f"Deleting: {path}")
        shutil.rmtree(path, ignore_errors=False, onerror=handleError)
        print(f"✓ Deleted: {path}")
        return True
    except Exception as e:
        print(f"✗ Error deleting {path}: {e}")
        return False

def handleError(func, path, exc_info):
    """Error handler for rmtree."""
    print(f"  Error with {path}: {exc_info[1]}")
    if not os.access(path, os.W_OK):
        # Try to add write permissions
        os.chmod(path, 0o777)
        func(path)

def main():
    mobile_dir = '/Users/marting/Desktop/CasusApp/mobile'
    
    directories_to_delete = [
        os.path.join(mobile_dir, 'node_modules_to_delete_1772573194'),
        os.path.join(mobile_dir, 'node_modules_to_delete_space_1772573205')
    ]
    
    files_to_delete = [
        os.path.join(mobile_dir, '.DS_Store')
    ]
    
    print("=== Cleaning up problematic directories and files ===\n")
    
    success = True
    for directory in directories_to_delete:
        if not delete_directory(directory):
            success = False
    
    for file_path in files_to_delete:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"✓ Deleted file: {file_path}")
            else:
                print(f"✓ File does not exist: {file_path}")
        except Exception as e:
            print(f"✗ Error deleting file {file_path}: {e}")
            success = False
    
    print("\n=== Cleanup Summary ===")
    if success:
        print("✓ All problematic files and directories have been removed!")
        return 0
    else:
        print("✗ Some files or directories could not be removed.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
