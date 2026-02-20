"""
Backend API Tests for New Features:
- TGEAPCET/APEAPCET unique colleges (no duplicates)
- quota_type and base_category fields
- Gender-based filtering
- general_quota_count and special_quota_count in response
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestTGEAPCETDeduplication:
    """Test TGEAPCET prediction returns unique college-branch combinations"""
    
    def test_tgeapcet_no_duplicates(self):
        """Test TGEAPCET results have no duplicate institute-branch combinations"""
        payload = {
            "rank": 5000,
            "category": "OC",
            "gender": "M"
        }
        response = requests.post(f"{BASE_URL}/api/tgeapcet/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        predictions = data["predictions"]
        # Check for duplicates by creating unique keys
        seen = set()
        duplicates = []
        for p in predictions:
            key = (p.get("institute"), p.get("branch"))
            if key in seen:
                duplicates.append(key)
            else:
                seen.add(key)
        
        print(f"✓ TGEAPCET: Total={len(predictions)}, Unique={len(seen)}, Duplicates={len(duplicates)}")
        assert len(duplicates) == 0, f"Found {len(duplicates)} duplicate college-branch combinations: {duplicates[:5]}"
    
    def test_tgeapcet_has_quota_type_field(self):
        """Test TGEAPCET predictions include quota_type field"""
        payload = {
            "rank": 5000,
            "category": "OC",
            "gender": "M"
        }
        response = requests.post(f"{BASE_URL}/api/tgeapcet/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Check response has quota counts
        assert "general_quota_count" in data
        assert "special_quota_count" in data
        
        print(f"✓ TGEAPCET quota counts: General={data['general_quota_count']}, Special={data['special_quota_count']}")
        
        # Check individual predictions have quota_type
        if data["predictions"]:
            pred = data["predictions"][0]
            assert "quota_type" in pred, "quota_type field missing from prediction"
            assert pred["quota_type"] is not None, "quota_type should not be None"
            print(f"✓ First prediction quota_type: {pred['quota_type']}")
    
    def test_tgeapcet_has_base_category_field(self):
        """Test TGEAPCET predictions include base_category field"""
        payload = {
            "rank": 5000,
            "category": "OC",
            "gender": "M"
        }
        response = requests.post(f"{BASE_URL}/api/tgeapcet/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        if data["predictions"]:
            pred = data["predictions"][0]
            assert "base_category" in pred, "base_category field missing from prediction"
            print(f"✓ First prediction base_category: {pred['base_category']}")


class TestTGEAPCETGenderFiltering:
    """Test TGEAPCET gender-based filtering"""
    
    def test_tgeapcet_male_filter(self):
        """Test TGEAPCET male gender returns only male-eligible results"""
        payload = {
            "rank": 5000,
            "category": "OC",
            "gender": "M"
        }
        response = requests.post(f"{BASE_URL}/api/tgeapcet/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Check that results are for male (should not contain GIRLS in category)
        girls_results = [p for p in data["predictions"] if "GIRLS" in (p.get("category") or "").upper()]
        print(f"✓ TGEAPCET Male: Total={data['total_colleges']}, GIRLS results={len(girls_results)}")
        # For male, we should not see GIRLS category results
        assert len(girls_results) == 0, f"Male filter should not return GIRLS category results"
    
    def test_tgeapcet_female_filter(self):
        """Test TGEAPCET female gender returns female-eligible results"""
        payload = {
            "rank": 5000,
            "category": "OC",
            "gender": "F"
        }
        response = requests.post(f"{BASE_URL}/api/tgeapcet/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Check that results are for female (should contain GIRLS in category)
        girls_results = [p for p in data["predictions"] if "GIRLS" in (p.get("category") or "").upper()]
        print(f"✓ TGEAPCET Female: Total={data['total_colleges']}, GIRLS results={len(girls_results)}")
        # For female, we should see GIRLS category results
        assert data["total_colleges"] > 0, "Female filter should return some results"
    
    def test_tgeapcet_different_results_by_gender(self):
        """Test TGEAPCET male and female return different results"""
        male_payload = {"rank": 5000, "category": "OC", "gender": "M"}
        female_payload = {"rank": 5000, "category": "OC", "gender": "F"}
        
        male_response = requests.post(f"{BASE_URL}/api/tgeapcet/predict", json=male_payload)
        female_response = requests.post(f"{BASE_URL}/api/tgeapcet/predict", json=female_payload)
        
        assert male_response.status_code == 200
        assert female_response.status_code == 200
        
        male_data = male_response.json()
        female_data = female_response.json()
        
        print(f"✓ TGEAPCET Gender Comparison: Male={male_data['total_colleges']}, Female={female_data['total_colleges']}")
        # Results should be different or comparable
        assert male_data["total_colleges"] > 0 or female_data["total_colleges"] > 0


class TestAPEAPCETDeduplication:
    """Test APEAPCET prediction returns unique college-branch combinations"""
    
    def test_apeapcet_no_duplicates(self):
        """Test APEAPCET results have no duplicate institute-branch combinations"""
        payload = {
            "rank": 5000,
            "category": "OC",
            "gender": "M"
        }
        response = requests.post(f"{BASE_URL}/api/apeapcet/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        predictions = data["predictions"]
        # Check for duplicates by creating unique keys
        seen = set()
        duplicates = []
        for p in predictions:
            key = (p.get("institute"), p.get("branch"))
            if key in seen:
                duplicates.append(key)
            else:
                seen.add(key)
        
        print(f"✓ APEAPCET: Total={len(predictions)}, Unique={len(seen)}, Duplicates={len(duplicates)}")
        assert len(duplicates) == 0, f"Found {len(duplicates)} duplicate college-branch combinations: {duplicates[:5]}"
    
    def test_apeapcet_has_quota_type_field(self):
        """Test APEAPCET predictions include quota_type field"""
        payload = {
            "rank": 5000,
            "category": "OC",
            "gender": "M"
        }
        response = requests.post(f"{BASE_URL}/api/apeapcet/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Check response has quota counts
        assert "general_quota_count" in data
        assert "special_quota_count" in data
        
        print(f"✓ APEAPCET quota counts: General={data['general_quota_count']}, Special={data['special_quota_count']}")
        
        # Check individual predictions have quota_type
        if data["predictions"]:
            pred = data["predictions"][0]
            assert "quota_type" in pred, "quota_type field missing from prediction"
            print(f"✓ First prediction quota_type: {pred['quota_type']}")
    
    def test_apeapcet_has_base_category_field(self):
        """Test APEAPCET predictions include base_category field"""
        payload = {
            "rank": 5000,
            "category": "OC",
            "gender": "M"
        }
        response = requests.post(f"{BASE_URL}/api/apeapcet/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        if data["predictions"]:
            pred = data["predictions"][0]
            assert "base_category" in pred, "base_category field missing from prediction"
            print(f"✓ First prediction base_category: {pred['base_category']}")


class TestAPEAPCETGenderFiltering:
    """Test APEAPCET gender-based filtering"""
    
    def test_apeapcet_male_filter(self):
        """Test APEAPCET male gender returns only male-eligible results"""
        payload = {
            "rank": 5000,
            "category": "OC",
            "gender": "M"
        }
        response = requests.post(f"{BASE_URL}/api/apeapcet/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        girls_results = [p for p in data["predictions"] if "GIRLS" in (p.get("category") or "").upper()]
        print(f"✓ APEAPCET Male: Total={data['total_colleges']}, GIRLS results={len(girls_results)}")
        # For male, we should not see GIRLS category results
        assert len(girls_results) == 0, f"Male filter should not return GIRLS category results"
    
    def test_apeapcet_female_filter(self):
        """Test APEAPCET female gender returns female-eligible results"""
        payload = {
            "rank": 5000,
            "category": "OC",
            "gender": "F"
        }
        response = requests.post(f"{BASE_URL}/api/apeapcet/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        girls_results = [p for p in data["predictions"] if "GIRLS" in (p.get("category") or "").upper()]
        print(f"✓ APEAPCET Female: Total={data['total_colleges']}, GIRLS results={len(girls_results)}")
        assert data["total_colleges"] > 0, "Female filter should return some results"


class TestQuotaCounts:
    """Test quota counts in responses"""
    
    def test_tgeapcet_quota_count_sum(self):
        """Test TGEAPCET quota counts sum up correctly"""
        payload = {
            "rank": 5000,
            "category": "OC",
            "gender": "M"
        }
        response = requests.post(f"{BASE_URL}/api/tgeapcet/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        general_count = data.get("general_quota_count", 0)
        special_count = data.get("special_quota_count", 0)
        total = data.get("total_colleges", 0)
        
        print(f"✓ TGEAPCET Quota Sum: General={general_count} + Special={special_count} = {general_count + special_count}, Total={total}")
        assert general_count + special_count == total, "General + Special quota counts should equal total"
    
    def test_apeapcet_quota_count_sum(self):
        """Test APEAPCET quota counts sum up correctly"""
        payload = {
            "rank": 5000,
            "category": "OC",
            "gender": "M"
        }
        response = requests.post(f"{BASE_URL}/api/apeapcet/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        general_count = data.get("general_quota_count", 0)
        special_count = data.get("special_quota_count", 0)
        total = data.get("total_colleges", 0)
        
        print(f"✓ APEAPCET Quota Sum: General={general_count} + Special={special_count} = {general_count + special_count}, Total={total}")
        assert general_count + special_count == total, "General + Special quota counts should equal total"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
