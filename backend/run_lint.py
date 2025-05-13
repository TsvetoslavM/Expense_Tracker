#!/usr/bin/env python
"""
Скрипт за изпълнение на linting и форматиране на код за Expense Tracker backend.
Използвайте го с: python run_lint.py [--check] [--fix] [--format]
"""

import argparse
import os
import subprocess
import sys

# Дефинираме директориите, които ще проверяваме
TARGET_DIRS = ["app", "tests"]


def run_command(command, exit_on_error=True):
    """Изпълнява команда и връща резултата."""
    print(f"Running: {' '.join(command)}")
    result = subprocess.run(command, capture_output=True, text=True)
    
    if result.stdout:
        print(result.stdout)
    
    if result.stderr:
        print(result.stderr, file=sys.stderr)
    
    if exit_on_error and result.returncode != 0:
        sys.exit(result.returncode)
    
    return result


def run_pylint(dirs, fix=False):
    """Изпълнява pylint върху зададените директории."""
    print("\n=== Running Pylint ===")
    command = ["pylint"]
    
    if fix:
        # Pylint няма директна опция за автоматично поправяне,
        # но можем да покажем съобщения, които могат да бъдат поправени
        print("Note: Pylint does not auto-fix, but will show detailed errors")
    
    run_command(command + dirs)


def run_black(dirs, check=False):
    """Изпълнява black за форматиране на код."""
    print("\n=== Running Black ===")
    command = ["black"]
    
    if check:
        command.append("--check")
        command.append("--diff")
    
    run_command(command + dirs)


def run_isort(dirs, check=False):
    """Изпълнява isort за подреждане на импорти."""
    print("\n=== Running isort ===")
    command = ["isort"]
    
    if check:
        command.append("--check")
        command.append("--diff")
    
    run_command(command + dirs)


def main():
    """Главна функция за изпълнение на linting инструментите."""
    parser = argparse.ArgumentParser(description="Run linting checks on Python code")
    parser.add_argument("--check", action="store_true", help="Only check, don't modify files")
    parser.add_argument("--fix", action="store_true", help="Try to automatically fix issues")
    parser.add_argument("--format", action="store_true", help="Run code formatters (black, isort)")
    
    args = parser.parse_args()
    
    # Трансформираме списъка с директории в списък със стрингове
    dirs = [dir for dir in TARGET_DIRS if os.path.exists(dir)]
    
    if not dirs:
        print("Error: No target directories found!")
        sys.exit(1)
    
    print(f"Running linting tools on directories: {', '.join(dirs)}")
    
    # Изпълняваме форматери ако е избрано --format или --fix
    if args.format or args.fix:
        run_black(dirs, check=False)
        run_isort(dirs, check=False)
    
    # Изпълняваме проверки, но не променяме файловете ако е избрано --check
    if args.check:
        run_black(dirs, check=True)
        run_isort(dirs, check=True)
    
    # Винаги изпълняваме pylint
    run_pylint(dirs, fix=args.fix)
    
    print("\n=== All linting checks completed! ===")


if __name__ == "__main__":
    main() 