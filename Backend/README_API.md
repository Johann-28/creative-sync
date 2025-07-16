# EdgeVerve AI Brief Generator API

A Flask-based REST API that generates creative briefs for EdgeVerve AI Platform using agentic AI research.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the API Server
```bash
python simple_server.py
```

The server will start on `http://localhost:5000`

### 3. Test the API
```bash
python test_api.py
```

## 📡 API Endpoints

### `POST /generate-brief`
Generates a complete creative brief with AI research.

**Request:**
```json
{
  "company_name": "EdgeVerve AI",
  "custom_focus": "Enterprise AI Platform"
}
```

**Response Format:**
```json
{
  "success": true,
  "timestamp": "2025-07-16T10:30:00",
  "sections": [
    {
      "id": 4,
      "icon": "📱",
      "title": "Suggested Channels/Media",
      "content": "<strong>Primary Channels:</strong> LinkedIn sponsored content, Healthcare industry publications<br><strong>Secondary:</strong> Email sequences, Webinar series, Demo videos<br><strong>Content Formats:</strong> Video testimonials, Interactive demos, Case studies, Infographics",
      "type": "text"
    }
  ],
  "metadata": {
    "research_time": 15.42,
    "agents_used": ["competitor", "trends", "audience", "brief_generator"],
    "total_sections": 6
  }
}
```

### `GET /brief-preview`
Returns sample formatted sections without generating new content.

### `GET /health`
Health check endpoint.

## 📋 Section Types Generated

| ID | Icon | Title | Description |
|----|------|-------|-------------|
| 1 | 🎯 | Business Objective | Main business goals and metrics |
| 2 | 👥 | Target Audience | Detailed audience profiles and demographics |
| 3 | 💡 | Solution/Offering | Platform features and differentiators |
| 4 | 📱 | Suggested Channels/Media | **Primary focus - channel recommendations** |
| 5 | 🏢 | Competitive Landscape | Competitor analysis and positioning |
| 6 | 📊 | Market Trends & Demand | Industry trends and growth data |

## 🎯 Key Features

- **Agentic AI Research**: Automatically researches competitors, trends, and audience data
- **EdgeVerve Focus**: Specifically optimized for AI platform briefs
- **Structured Output**: Returns data in the exact format specified
- **Real-time Generation**: Creates fresh briefs with current market data
- **HTML Content**: Formatted content ready for web display

## 🔧 Configuration

The API uses the agentic brief system with:
- **Google Gemini AI**: For content generation
- **Competitor Research**: Enterprise AI platform analysis
- **Trends Analysis**: AI technology market trends
- **Audience Insights**: CIO and technology leader behavior

## 📱 Example Usage

### Generate Brief
```bash
curl -X POST http://localhost:5000/generate-brief \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "EdgeVerve AI",
    "custom_focus": "Enterprise AI Platform"
  }'
```

### Get Preview
```bash
curl http://localhost:5000/brief-preview
```

## 🎨 Frontend Integration

The API returns data in a format ready for frontend consumption:

```javascript
// Fetch brief data
const response = await fetch('http://localhost:5000/generate-brief', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ company_name: 'EdgeVerve AI' })
});

const data = await response.json();

// Use the sections data
data.sections.forEach(section => {
  console.log(`${section.icon} ${section.title}`);
  document.getElementById('content').innerHTML += section.content;
});
```

## ⚠️ Important Notes

1. **Processing Time**: Brief generation takes 30-60 seconds due to AI research
2. **API Keys**: Update the API keys in `api_server.py` for production use
3. **CORS**: Enabled for all origins in development mode
4. **Error Handling**: Returns structured error responses

## 🔍 Testing

Run the test suite to verify all endpoints:

```bash
python test_api.py
```

The test will:
- ✅ Check server health
- ✅ Test preview endpoint
- ✅ Generate a full brief
- ✅ Validate the format matches requirements
- 💾 Save response to `api_test_response.json`

## 📊 Sample Output

The API generates sections like this:

```json
{
  "id": 4,
  "icon": "📱",
  "title": "Suggested Channels/Media",
  "content": "<strong>Primary Channels:</strong> LinkedIn sponsored content, Industry publications, Google Ads<br><strong>Secondary:</strong> YouTube demos, Webinar series, Email sequences<br><strong>Content Formats:</strong> Executive briefings, ROI case studies, Interactive demos, Analyst reports<br><strong>Engagement Times:</strong> Tuesday-Thursday 9-11 AM, Wednesday 2-4 PM",
  "type": "text"
}
```

Perfect for dashboard display and further processing! 🎉
