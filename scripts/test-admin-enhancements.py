import urllib.request
import urllib.parse
import json
import http.cookiejar

BASE_URL = "http://localhost:3000"

def test_admin_enhancements():
    print("==================================================")
    print("TESTING ADMIN ENHANCEMENTS (CUSTOM METAS & FULL CRUD)")
    print("==================================================")

    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

    def get(path):
        req = urllib.request.Request(BASE_URL + path)
        with opener.open(req) as resp:
            return resp.status, resp.read().decode("utf-8", errors="ignore")

    def post_json(path, data):
        payload = json.dumps(data).encode("utf-8")
        req = urllib.request.Request(BASE_URL + path, data=payload, headers={"Content-Type": "application/json"})
        with opener.open(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))

    def put_json(path, data):
        payload = json.dumps(data).encode("utf-8")
        req = urllib.request.Request(BASE_URL + path, data=payload, headers={"Content-Type": "application/json"}, method="PUT")
        with opener.open(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))

    def delete_req(path):
        req = urllib.request.Request(BASE_URL + path, method="DELETE")
        with opener.open(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))

    # 1. Login as Admin
    status, res = post_json("/api/auth/login", {
        "email": "admin@nepalexam.com",
        "password": "Admin@123"
    })
    assert status == 200 and res.get("success"), "Admin login failed"
    print("✓ 1. Admin login successful")

    # 2. Test Question Creation with Custom Subject, Topic, Language & Question Type
    custom_sub = "Banking Laws & Accounting"
    custom_top = "Foreign Exchange Regulation Act 2019"
    custom_lang = "Maithili"
    custom_type = "Special Practice Capsule 2081"

    status, q_res = post_json("/api/admin/questions/create", {
        "customSubjectName": custom_sub,
        "customTopicName": custom_top,
        "language": custom_lang,
        "questionType": custom_type,
        "difficulty": "HARD",
        "status": "PUBLISHED",
        "questionText": "What is the primary statutory authority for foreign currency control in Nepal?",
        "optionA": "Nepal Rastra Bank",
        "optionB": "Ministry of Finance",
        "optionC": "Commercial Banks Association",
        "optionD": "Department of Revenue Investigation",
        "correctOption": "A",
        "explanation": "According to Section 3 of Foreign Exchange Regulation Act 2019, Nepal Rastra Bank regulates foreign exchange."
    })
    assert status == 200 and q_res.get("success"), f"Custom question creation failed: {q_res}"
    created_q_id = q_res.get("questionId")
    print(f"✓ 2. Created question with custom Subject, Topic, Language ({custom_lang}) and Type ({custom_type}) -> ID: {created_q_id}")

    # 3. Verify custom fields appear on Question Bank View Page
    status, html = get("/admin/questions")
    assert status == 200, "Admin questions page failed"
    assert (custom_sub in html or custom_sub.replace("&", "&amp;") in html), "Custom subject not rendered on questions view page"
    assert custom_top in html, "Custom topic not rendered on questions view page"
    assert custom_lang in html, "Custom language badge not rendered on questions view page"
    assert custom_type in html, "Custom question type badge not rendered on questions view page"
    print("✓ 3. Verified custom Subject, Topic, Language and Type are displayed on /admin/questions view page!")

    # 4. Test Study Notes Full CRUD
    status, note_res = post_json("/api/admin/notes", {
        "title": "Comprehensive Summary: Foreign Exchange Regulation Act 2019",
        "customSubjectName": custom_sub,
        "customTopicName": custom_top,
        "summary": "Key provisions regarding license, penalties and NRB directives.",
        "contentHtml": "<p>Section 3 empowers Nepal Rastra Bank to issue licenses for foreign currency transactions.</p>",
        "source": "Nepal Gazette 2019",
        "accessLevel": "FREE",
        "status": "PUBLISHED"
    })
    assert status == 200 and note_res.get("success"), f"Note creation failed: {note_res}"
    note_id = note_res.get("noteId")
    print(f"✓ 4. Created study note with custom subject/topic -> ID: {note_id}")

    # Update note
    status, upd_res = put_json("/api/admin/notes", {
        "id": note_id,
        "title": "Updated Summary: Foreign Exchange Regulation Act 2019 (Amended)",
        "status": "PUBLISHED"
    })
    assert status == 200 and upd_res.get("success"), "Note update failed"
    print("✓ 5. Updated study note successfully")

    # Verify notes page
    status, html = get("/admin/notes")
    assert status == 200, "Admin notes page failed"
    assert "Updated Summary" in html, "Updated note not found on /admin/notes"
    print("✓ 6. Verified study note appears on /admin/notes table")

    # 5. Test Syllabus Management
    status, syl_data = get("/api/admin/syllabus")
    assert status == 200, "Get syllabus API failed"
    exams = json.loads(syl_data).get("exams", [])
    assert len(exams) > 0, "No exams in syllabus"
    exam_id = exams[0]["id"]

    # Add Subject
    status, sub_res = post_json("/api/admin/syllabus", {
        "action": "ADD_SUBJECT",
        "examId": exam_id,
        "name": "Contemporary Economic Affairs 2081",
        "code": "ECON_2081"
    })
    assert status == 200 and sub_res.get("success"), "Add subject failed"
    new_sub_id = sub_res["subject"]["id"]
    print(f"✓ 7. Added new Subject via Syllabus Manager -> ID: {new_sub_id}")

    # Add Topic
    status, top_res = post_json("/api/admin/syllabus", {
        "action": "ADD_TOPIC",
        "subjectId": new_sub_id,
        "name": "Budget Deficit & Debt Management",
        "code": "BUDGET_DEBT",
        "estimatedMinutes": 45
    })
    assert status == 200 and top_res.get("success"), "Add topic failed"
    new_top_id = top_res["topic"]["id"]
    print(f"✓ 8. Added new Topic under subject -> ID: {new_top_id}")

    # Verify Syllabus Page
    status, html = get("/admin/syllabus")
    assert status == 200, "Admin syllabus page failed"
    assert "Contemporary Economic Affairs 2081" in html, "New subject not visible on /admin/syllabus"
    assert ("Budget Deficit & Debt Management" in html or "Budget Deficit &amp; Debt Management" in html), "New topic not visible on /admin/syllabus"
    print("✓ 9. Verified new Subject and Topic rendered on /admin/syllabus")

    # 6. Test Mock Test Creation & Management
    status, mock_res = post_json("/api/admin/mock-tests", {
        "examId": exam_id,
        "title": "Lok Sewa Section Officer Special Speed Mock Test 2081",
        "description": "50 questions with official -20% negative deduction in 45 minutes.",
        "durationMinutes": 45,
        "totalQuestions": 50,
        "marksPerCorrect": 2.0,
        "negativePenaltyPercent": 20.0,
        "attemptLimit": 3,
        "accessLevel": "FREE",
        "status": "PUBLISHED",
        "autoPopulate": True
    })
    assert status == 200 and mock_res.get("success"), f"Mock test creation failed: {mock_res}"
    mock_id = mock_res.get("testId")
    print(f"✓ 10. Created Mock Test with automatic question population -> ID: {mock_id}")

    # Update Mock Test
    status, mock_upd = put_json("/api/admin/mock-tests", {
        "id": mock_id,
        "title": "Lok Sewa Section Officer Grand Speed Mock Test 2081",
        "durationMinutes": 50
    })
    assert status == 200 and mock_upd.get("success"), "Mock test update failed"
    print("✓ 11. Updated mock test settings successfully")

    # Verify Mock Tests Page
    status, html = get("/admin/mock-tests")
    assert status == 200, "Admin mock tests page failed"
    assert "Grand Speed Mock Test" in html, "Updated mock test not visible on /admin/mock-tests"
    print("✓ 12. Verified mock test is displayed with live controls on /admin/mock-tests")

    # Clean up test note and mock test
    delete_req(f"/api/admin/notes?id={note_id}")
    delete_req(f"/api/admin/mock-tests?id={mock_id}")
    delete_req(f"/api/admin/questions/create?id={created_q_id}")
    print("✓ 13. Cleaned up transient test records")

    print("\n==================================================")
    print("ALL 13 ADMIN ENHANCEMENT CHECKS PASSED (13/13)!")
    print("==================================================")

if __name__ == "__main__":
    test_admin_enhancements()
