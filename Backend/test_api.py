import requests
import json
from datetime import datetime

def test_brief_api():
    """Test the creative brief API endpoints"""
    
    base_url = "http://localhost:5000"
    
    print("🧪 Testing EdgeVerve AI Brief Generator API")
    print("=" * 50)
    
    # Test 1: Health check
    print("1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("   ✅ Health check passed")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("   ❌ Server not running. Start the API server first with: python api_server.py")
        return
    
    # Test 2: Preview endpoint
    print("\n2. Testing preview endpoint...")
    try:
        response = requests.get(f"{base_url}/brief-preview")
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Preview endpoint working")
            print(f"   📊 Sample sections: {data['metadata']['total_sections']}")
            
            # Display first section as example
            if data['sections']:
                first_section = data['sections'][0]
                print(f"\n   📋 Sample Section:")
                print(f"   {first_section['icon']} {first_section['title']}")
                print(f"   Content: {first_section['content'][:100]}...")
        else:
            print(f"   ❌ Preview failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Preview test failed: {str(e)}")
    
    # Test 3: Generate brief (this will take longer)
    print("\n3. Testing brief generation endpoint...")
    print("   ⏳ This may take 30-60 seconds...")
    
    try:
        # Optional: Send custom parameters
        payload = {
            "company_name": "EdgeVerve AI",
            "custom_focus": "Enterprise AI Platform"
        }
        
        response = requests.post(
            f"{base_url}/generate-brief",
            json=payload,
            timeout=120  # 2 minute timeout
        )
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Brief generation successful!")
            print(f"   📊 Total sections: {data['metadata']['total_sections']}")
            print(f"   ⏱️  Research time: {data['metadata']['research_time']:.2f} seconds")
            print(f"   🤖 Agents used: {len(data['metadata']['agents_used'])}")
            
            # Display the channels section (ID 4) as requested
            channels_section = None
            for section in data['sections']:
                if section['id'] == 4 or 'channel' in section['title'].lower():
                    channels_section = section
                    break
            
            if channels_section:
                print(f"\n   📱 Channels Section (ID: {channels_section['id']}):")
                print(f"   Icon: {channels_section['icon']}")
                print(f"   Title: {channels_section['title']}")
                print(f"   Content: {channels_section['content']}")
                print(f"   Type: {channels_section['type']}")
            
            # Save full response to file for inspection
            with open('api_test_response.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"\n   💾 Full response saved to: api_test_response.json")
            
        else:
            print(f"   ❌ Brief generation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except requests.exceptions.Timeout:
        print("   ⏰ Request timed out. The server might be processing...")
    except Exception as e:
        print(f"   ❌ Brief generation test failed: {str(e)}")
    
    print(f"\n✅ API Testing Complete - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

def display_example_format():
    """Shows the expected output format"""
    
    print("\n📋 Expected Output Format:")
    print("=" * 30)
    
    example = {
        "id": 4,
        "icon": "📱",
        "title": "Suggested Channels/Media",
        "content": """<strong>Primary Channels:</strong> LinkedIn sponsored content, Healthcare industry publications<br>
        <strong>Secondary:</strong> Email sequences, Webinar series, Demo videos<br>
        <strong>Content Formats:</strong> Video testimonials, Interactive demos, Case studies, Infographics""",
        "type": "text"
    }
    
    print(json.dumps(example, indent=2))

if __name__ == "__main__":
    print("🚀 EdgeVerve AI Brief API Tester")
    print("=" * 50)
    print("Make sure to start the API server first:")
    print("python api_server.py")
    print("")
    
    # Show expected format
    display_example_format()
    
    # Run tests
    test_brief_api()
