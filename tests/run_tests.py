import sys
import os

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from tests.test_api import (
    test_tc01_health_check,
    test_tc02_auth_register_and_login,
    test_tc03_create_resume_with_sections,
    test_tc04_autosave_draft,
    test_tc05_mandatory_validation,
    test_tc06_pdf_export_all_templates,
    test_tc07_crud_duplicate_and_delete,
    test_tc08_photo_upload,
    test_tc09_multi_persona_demo_login
)

def run_all_tests():
    print("==================================================")
    print("RUNNING CSE347 LAB EXAM VERIFICATION TEST SUITE")
    print("==================================================")
    
    tests = [
        ("TC-01: Health & Service Endpoint", test_tc01_health_check),
        ("TC-02: Authentication (Register & Login with JWT)", test_tc02_auth_register_and_login),
        ("TC-03: Full Resume Creation with Child Sections", test_tc03_create_resume_with_sections),
        ("TC-04: Auto-Save Draft to Database", test_tc04_autosave_draft),
        ("TC-05: Mandatory Fields Validation Engine", test_tc05_mandatory_validation),
        ("TC-06: PDF Generation for All 4 Design Templates", test_tc06_pdf_export_all_templates),
        ("TC-07: Resume CRUD Operations (Duplicate & Delete)", test_tc07_crud_duplicate_and_delete),
        ("TC-08: Profile Photo / Avatar Upload Engine", test_tc08_photo_upload),
        ("TC-09: Multi-Persona Demo Login & Data Seeding", test_tc09_multi_persona_demo_login),
    ]

    passed = 0
    failed = 0

    for name, func in tests:
        try:
            print(f"RUNNING: {name}", flush=True)
            func()
            print(f"[PASS] {name}", flush=True)
            passed += 1
        except Exception as e:
            print(f"[FAIL] {name}: {str(e)}", flush=True)
            failed += 1

    print("==================================================")
    print(f"TEST RESULTS: {passed} PASSED, {failed} FAILED (TOTAL: {len(tests)})")
    print("==================================================")
    
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_all_tests()
