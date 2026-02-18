"""
Backend API Tests for Edu9 Career Guidance Multi-Exam College Predictor Platform
Testing endpoints: JEE, TGEAPCET, APEAPCET, COMEDK predictors
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAPIRoot:
    """Root API endpoint tests"""
    
    def test_api_root(self):
        """Test API root responds"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ API root: {data}")


class TestJEEPredictor:
    """JEE Main Predictor API Tests"""
    
    def test_jee_metadata(self):
        """Test JEE metadata endpoint returns correct data"""
        response = requests.get(f"{BASE_URL}/api/jee/metadata")
        assert response.status_code == 200
        data = response.json()
        # Validate key fields exist
        assert "stats" in data
        print(f"✓ JEE metadata: {data.get('stats', {})}")
    
    def test_jee_predict_basic(self):
        """Test JEE prediction with rank 5000, General, Gender-Neutral"""
        payload = {
            "rank": 5000,
            "seat_type": "OPEN",
            "gender": "Gender-Neutral",
            "institute_types": ["IIT", "NIT", "IIIT", "GFTI"],
            "quota": "AI"
        }
        response = requests.post(f"{BASE_URL}/api/jee/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "total_colleges" in data
        assert "safe_count" in data
        assert "good_count" in data
        assert "reach_count" in data
        assert "predictions" in data
        assert isinstance(data["predictions"], list)
        
        print(f"✓ JEE predict (rank=5000): Total={data['total_colleges']}, Safe={data['safe_count']}, Good={data['good_count']}, Reach={data['reach_count']}")
        
        # Verify predictions have required fields
        if data["predictions"]:
            pred = data["predictions"][0]
            assert "institute" in pred
            assert "chance" in pred
            assert "probability" in pred
            assert pred["chance"] in ["SAFE", "GOOD", "REACH"]

    def test_jee_predict_iit_only(self):
        """Test JEE prediction with only IIT filter"""
        payload = {
            "rank": 5000,
            "seat_type": "OPEN",
            "gender": "Gender-Neutral",
            "institute_types": ["IIT"],
            "quota": "AI"
        }
        response = requests.post(f"{BASE_URL}/api/jee/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        print(f"✓ JEE predict (IIT only): Total={data['total_colleges']}")


class TestTGEAPCETPredictor:
    """TGEAPCET Predictor API Tests"""
    
    def test_tgeapcet_metadata(self):
        """Test TGEAPCET metadata endpoint"""
        response = requests.get(f"{BASE_URL}/api/tgeapcet/metadata")
        assert response.status_code == 200
        data = response.json()
        assert "stats" in data or "branches" in data or "districts" in data
        print(f"✓ TGEAPCET metadata: districts={len(data.get('districts', []))}, branches={len(data.get('branches', []))}")
    
    def test_tgeapcet_predict_basic(self):
        """Test TGEAPCET prediction with rank 5000, OC, Male"""
        payload = {
            "rank": 5000,
            "category": "OC",
            "gender": "M"
        }
        response = requests.post(f"{BASE_URL}/api/tgeapcet/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert "total_colleges" in data
        assert "safe_count" in data
        assert "predictions" in data
        
        print(f"✓ TGEAPCET predict (rank=5000, OC, M): Total={data['total_colleges']}, Safe={data['safe_count']}, Good={data['good_count']}, Reach={data['reach_count']}")
    
    def test_tgeapcet_predict_with_special_quota(self):
        """Test TGEAPCET prediction with special quota (PWD)"""
        payload = {
            "rank": 5000,
            "category": "OC",
            "gender": "M",
            "special_quota": "PWD"
        }
        response = requests.post(f"{BASE_URL}/api/tgeapcet/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        print(f"✓ TGEAPCET predict with PWD quota: Total={data['total_colleges']}")


class TestAPEAPCETPredictor:
    """APEAPCET Predictor API Tests"""
    
    def test_apeapcet_metadata(self):
        """Test APEAPCET metadata endpoint"""
        response = requests.get(f"{BASE_URL}/api/apeapcet/metadata")
        assert response.status_code == 200
        data = response.json()
        print(f"✓ APEAPCET metadata: colleges={len(data.get('colleges', []))}, branches={len(data.get('branches', []))}, districts={len(data.get('districts', []))}")
    
    def test_apeapcet_predict_basic(self):
        """Test APEAPCET prediction with rank 5000, OC, Male"""
        payload = {
            "rank": 5000,
            "category": "OC",
            "gender": "M"
        }
        response = requests.post(f"{BASE_URL}/api/apeapcet/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert "total_colleges" in data
        assert "predictions" in data
        
        print(f"✓ APEAPCET predict (rank=5000, OC, M): Total={data['total_colleges']}, Safe={data['safe_count']}, Good={data['good_count']}, Reach={data['reach_count']}")


class TestCOMEDKPredictor:
    """COMEDK Predictor API Tests - Newly implemented"""
    
    def test_comedk_metadata(self):
        """Test COMEDK metadata endpoint"""
        response = requests.get(f"{BASE_URL}/api/comedk/metadata")
        assert response.status_code == 200
        data = response.json()
        
        # COMEDK should have stats with 40 colleges, 15 branches, 2888 records
        stats = data.get("stats", data)
        print(f"✓ COMEDK metadata: colleges={stats.get('college_count', 'N/A')}, branches={stats.get('branch_count', 'N/A')}, records={stats.get('total_records', 'N/A')}")
    
    def test_comedk_predict_basic(self):
        """Test COMEDK prediction with rank 5000, GM, Male"""
        payload = {
            "rank": 5000,
            "category": "GM",
            "gender": "M"
        }
        response = requests.post(f"{BASE_URL}/api/comedk/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "total_colleges" in data
        assert "safe_count" in data
        assert "good_count" in data
        assert "reach_count" in data
        assert "predictions" in data
        
        print(f"✓ COMEDK predict (rank=5000, GM, M): Total={data['total_colleges']}, Safe={data['safe_count']}, Good={data['good_count']}, Reach={data['reach_count']}")
        
        # Verify predictions have required fields
        if data["predictions"]:
            pred = data["predictions"][0]
            assert "institute" in pred
            assert "chance" in pred
            assert "probability" in pred
            assert pred["chance"] in ["SAFE", "GOOD", "REACH"]
    
    def test_comedk_predict_with_branch_filter(self):
        """Test COMEDK prediction with branch filter"""
        payload = {
            "rank": 5000,
            "category": "GM",
            "gender": "M",
            "branch": "Computer Science"
        }
        response = requests.post(f"{BASE_URL}/api/comedk/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        print(f"✓ COMEDK predict with CSE filter: Total={data['total_colleges']}")


class TestValidation:
    """API Validation Tests"""
    
    def test_jee_predict_missing_rank(self):
        """Test JEE prediction fails without rank"""
        payload = {
            "seat_type": "OPEN",
            "gender": "Gender-Neutral"
        }
        response = requests.post(f"{BASE_URL}/api/jee/predict", json=payload)
        assert response.status_code == 422
        print("✓ JEE validation: Missing rank returns 422")
    
    def test_comedk_predict_missing_category(self):
        """Test COMEDK prediction fails without category"""
        payload = {
            "rank": 5000,
            "gender": "M"
        }
        response = requests.post(f"{BASE_URL}/api/comedk/predict", json=payload)
        assert response.status_code == 422
        print("✓ COMEDK validation: Missing category returns 422")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
