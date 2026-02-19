#!/usr/bin/env python3
"""
Backend API Testing for Edu9 Career Guidance Platform
Tests all API endpoints including APEAPCET prediction functionality
"""

import requests
import json
import sys
from datetime import datetime

class Edu9APITester:
    def __init__(self, base_url="https://edu9-predictor-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, description=""):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Test {self.tests_run}: {name}")
        if description:
            print(f"   Description: {description}")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            print(f"   Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Expected {expected_status}, got {response.status_code}")
                
                # Show response preview for successful tests
                try:
                    resp_json = response.json()
                    if isinstance(resp_json, dict):
                        print(f"   Response keys: {list(resp_json.keys())}")
                        if 'message' in resp_json:
                            print(f"   Message: {resp_json['message']}")
                except:
                    print(f"   Response length: {len(response.text)} characters")
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'url': url,
                    'response': response.text[:500]
                })

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else {}

        except requests.exceptions.Timeout:
            print(f"❌ FAILED - Request timeout")
            self.failed_tests.append({'name': name, 'error': 'Timeout'})
            return False, {}
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            self.failed_tests.append({'name': name, 'error': str(e)})
            return False, {}

    def test_root_api(self):
        """Test the root API endpoint"""
        return self.run_test(
            "Root API",
            "GET",
            "",
            200,
            description="Check if API server is responding"
        )

    def test_jee_metadata(self):
        """Test JEE metadata endpoint"""
        success, response = self.run_test(
            "JEE Metadata",
            "GET",
            "jee/metadata", 
            200,
            description="Get JEE stats (23 IITs, 32 NITs, 26 IIITs, 47 GFTIs)"
        )
        
        if success and 'stats' in response:
            stats = response['stats']
            print(f"   IIT Count: {stats.get('iit_count', 0)}")
            print(f"   NIT Count: {stats.get('nit_count', 0)}")
            print(f"   IIIT Count: {stats.get('iiit_count', 0)}")
            print(f"   GFTI Count: {stats.get('gfti_count', 0)}")
            print(f"   Total Records: {stats.get('total_records', 0)}")
                
        return success, response

    def test_jee_prediction(self):
        """Test JEE prediction endpoint"""
        test_data = {
            "rank": 10000,
            "seat_type": "OPEN",
            "gender": "Gender-Neutral",
            "institute_types": ["IIT", "NIT"],
            "quota": "AI"
        }
        
        success, response = self.run_test(
            "JEE Prediction",
            "POST",
            "jee/predict",
            200,
            data=test_data,
            description="Test JEE prediction with rank=10000, seat_type=OPEN, gender=Gender-Neutral"
        )
        
        if success:
            print(f"   Total colleges: {response.get('total_colleges', 0)}")
            print(f"   Safe: {response.get('safe_count', 0)}")
            print(f"   Good: {response.get('good_count', 0)}")
            print(f"   Reach: {response.get('reach_count', 0)}")
            
        return success, response

    def test_tgeapcet_metadata(self):
        """Test TGEAPCET metadata endpoint"""
        success, response = self.run_test(
            "TGEAPCET Metadata",
            "GET",
            "tgeapcet/metadata", 
            200,
            description="Get TGEAPCET colleges, branches, districts data"
        )
        
        if success and 'stats' in response:
            stats = response['stats']
            print(f"   University Count: {stats.get('university_count', 0)}")
            print(f"   College Count: {stats.get('college_count', 0)}")
            print(f"   Branch Count: {stats.get('branch_count', 0)}")
            print(f"   Total Records: {stats.get('total_records', 0)}")
                
        return success, response

    def test_tgeapcet_prediction(self):
        """Test TGEAPCET prediction endpoint"""
        test_data = {
            "rank": 15000,
            "category": "OC",
            "gender": "Male"
        }
        
        success, response = self.run_test(
            "TGEAPCET Prediction",
            "POST",
            "tgeapcet/predict",
            200,
            data=test_data,
            description="Test TGEAPCET prediction with rank=15000, category=OC, gender=Male"
        )
        
        if success:
            print(f"   Total colleges: {response.get('total_colleges', 0)}")
            print(f"   Safe: {response.get('safe_count', 0)}")
            print(f"   Good: {response.get('good_count', 0)}")
            print(f"   Reach: {response.get('reach_count', 0)}")
            
        return success, response

    def test_apeapcet_metadata(self):
        """Test APEAPCET metadata endpoint"""
        success, response = self.run_test(
            "APEAPCET Metadata",
            "GET",
            "apeapcet/metadata", 
            200,
            description="Get APEAPCET colleges, branches, districts data"
        )
        
        if success:
            metadata = response
            if 'colleges' in metadata:
                print(f"   Colleges: {len(metadata['colleges'])}")
            if 'branches' in metadata:
                print(f"   Branches: {len(metadata['branches'])}")
            if 'districts' in metadata:
                print(f"   Districts: {len(metadata['districts'])}")
                
        return success, response

    def test_apeapcet_prediction_basic(self):
        """Test APEAPCET prediction with basic data"""
        test_data = {
            "rank": 50000,
            "category": "OC", 
            "gender": "M"
        }
        
        success, response = self.run_test(
            "APEAPCET Basic Prediction",
            "POST",
            "apeapcet/predict",
            200,
            data=test_data,
            description="Test APEAPCET prediction with rank=50000, category=OC, gender=M (43806 records)"
        )
        
        if success:
            print(f"   Total colleges: {response.get('total_colleges', 0)}")
            print(f"   Safe: {response.get('safe_count', 0)}")
            print(f"   Good: {response.get('good_count', 0)}")
            print(f"   Reach: {response.get('reach_count', 0)}")
            
            predictions = response.get('predictions', [])
            if predictions:
                print(f"   First prediction: {predictions[0].get('institute', 'N/A')} - {predictions[0].get('chance', 'N/A')}")
                
        return success, response

    def test_apeapcet_prediction_detailed(self):
        """Test APEAPCET prediction with all filters"""
        test_data = {
            "rank": 25000,
            "category": "BC_A",
            "gender": "F", 
            "college_type": "College",
            "district": "Krishna",
            "branch": "Computer Science"
        }
        
        success, response = self.run_test(
            "APEAPCET Detailed Prediction",
            "POST", 
            "apeapcet/predict",
            200,
            data=test_data,
            description="Test prediction with all filters including district and branch"
        )
        
        if success:
            print(f"   Filtered results: {response.get('total_colleges', 0)} colleges")
            
        return success, response

    def test_apeapcet_prediction_invalid_data(self):
        """Test APEAPCET prediction with invalid data"""
        test_data = {
            "rank": "invalid_rank",
            "category": "INVALID",
            "gender": "X"
        }
        
        # This should either return 422 (validation error) or 200 with empty results
        success, response = self.run_test(
            "APEAPCET Invalid Data",
            "POST",
            "apeapcet/predict", 
            422,  # Expecting validation error
            data=test_data,
            description="Test prediction with invalid data types"
        )
        
        # If it returns 200, check if results are empty
        if not success:
            success_alt, response_alt = self.run_test(
                "APEAPCET Invalid Data (Alt)",
                "POST",
                "apeapcet/predict",
                200,  # Maybe it returns 200 with empty results
                data=test_data
            )
            if success_alt and response_alt.get('total_colleges', 0) == 0:
                success = True
                print("   ✅ Gracefully handled invalid data with empty results")
        
        return success, response

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Edu9 Backend API Testing")
        print(f"🌐 Base URL: {self.base_url}")
        print(f"🔗 API URL: {self.api_url}")
        print("=" * 60)
        
        # Test order matters - start with basics
        tests = [
            self.test_root_api,
            self.test_jee_metadata,
            self.test_jee_prediction,
            self.test_tgeapcet_metadata,
            self.test_tgeapcet_prediction,
            self.test_apeapcet_metadata,
            self.test_apeapcet_prediction_basic,
            self.test_apeapcet_prediction_detailed,
            self.test_apeapcet_prediction_invalid_data
        ]
        
        for test_func in tests:
            try:
                test_func()
            except Exception as e:
                print(f"❌ Test {test_func.__name__} crashed: {str(e)}")
                self.failed_tests.append({
                    'name': test_func.__name__,
                    'error': f'Test crashed: {str(e)}'
                })
            
            print("-" * 40)

        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print(f"✅ Passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Failed: {len(self.failed_tests)}")
        
        if self.failed_tests:
            print("\n🔥 FAILED TESTS:")
            for i, failure in enumerate(self.failed_tests, 1):
                print(f"{i}. {failure['name']}")
                if 'expected' in failure:
                    print(f"   Expected: {failure['expected']}, Got: {failure['actual']}")
                if 'error' in failure:
                    print(f"   Error: {failure['error']}")
                if 'url' in failure:
                    print(f"   URL: {failure['url']}")
                print()
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 80  # Consider 80%+ success rate as passing

def main():
    """Main test runner"""
    tester = Edu9APITester()
    success = tester.run_all_tests()
    
    # Save results for reference
    results = {
        'timestamp': datetime.now().isoformat(),
        'tests_run': tester.tests_run,
        'tests_passed': tester.tests_passed,
        'failed_tests': tester.failed_tests,
        'success_rate': (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Results saved to /app/backend_test_results.json")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())