from flask import Flask, jsonify, request
from flask_cors import CORS
import asyncio
import json
from datetime import datetime
from agentic_brief_enhanced import HackathonDemo

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class BriefFormatter:
    """Formats the agentic brief into the required structure"""
    
    def __init__(self):
        # Define the exact order and titles required
        self.required_sections = [
            {"id": 1, "title": "Business Objective", "icon": "🎯"},
            {"id": 2, "title": "Marketing Objective", "icon": "📈"},
            {"id": 3, "title": "Background", "icon": "📋"},
            {"id": 4, "title": "Target Audience", "icon": "👥"},
            {"id": 5, "title": "The Problem we are trying to solve", "icon": "❗"},
            {"id": 6, "title": "What are the challenges?", "icon": "⚠️"},
            {"id": 7, "title": "Solutions/Offering", "icon": "💡"},
            {"id": 8, "title": "Why XYZ (Platform)?", "icon": "🚀"},
            {"id": 9, "title": "Why does Enterprise need this solution?", "icon": "🏢"},
            {"id": 10, "title": "Present market trend and demand", "icon": "📊"},
            {"id": 11, "title": "Agency Statement of Work (SOW)", "icon": "📋"},
            {"id": 12, "title": "Key messages across Levels (L1 to L4)", "icon": "🎯"},
            {"id": 13, "title": "Campaign Theme, Approach/Outline/Creative Strategy", "icon": "🎨"},
            {"id": 14, "title": "Digital Assets (Banners, Microsite, Infographics, Email Designs)", "icon": "�️"},
            {"id": 15, "title": "Digital Campaign Videos", "icon": "🎬"},
            {"id": 16, "title": "AI / Tech Enabled Ideas", "icon": "🤖"},
            {"id": 17, "title": "Channels / Campaign Digital Mediums", "icon": "�"}
        ]
    
    def parse_brief_content(self, brief_content: str, research_data: dict) -> list:
        """Parses the brief content and returns formatted sections in the required order"""
        
        sections = []
        
        # Split content by lines and analyze
        lines = brief_content.split('\n')
        content_map = self._map_content_to_sections(lines)
        
        # Create sections in the exact required order
        for section_def in self.required_sections:
            section_content = self._extract_section_content(
                section_def["title"], 
                content_map, 
                brief_content,
                research_data
            )
            
            # Replace XYZ with actual company name
            title = section_def["title"]
            if "XYZ" in title:
                title = title.replace("XYZ", "EdgeVerve")
            
            section = {
                'id': section_def["id"],
                'icon': section_def["icon"],
                'title': title,
                'content': section_content,
                'type': 'text'
            }
            
            sections.append(section)
        
        return sections
    
    def _map_content_to_sections(self, lines: list) -> dict:
        """Maps content lines to section titles"""
        
        content_map = {}
        current_section = None
        current_content = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if it's a header
            if self._is_header_line(line):
                # Save previous section
                if current_section and current_content:
                    content_map[current_section] = '\n'.join(current_content)
                
                # Start new section
                current_section = self._normalize_header(line)
                current_content = []
            else:
                current_content.append(line)
        
        # Add last section
        if current_section and current_content:
            content_map[current_section] = '\n'.join(current_content)
        
        return content_map
    
    def _is_header_line(self, line: str) -> bool:
        """Checks if a line is a section header"""
        
        # Check for common header patterns
        if line.startswith('**') and line.endswith('**'):
            return True
        if line.startswith('#'):
            return True
        if line.isupper() and len(line.split()) <= 6:
            return True
        
        # Check for specific keywords that indicate headers
        header_keywords = [
            'objective', 'background', 'audience', 'problem', 'challenge',
            'solution', 'offering', 'why', 'enterprise', 'trend', 'demand',
            'statement of work', 'sow', 'message', 'campaign', 'theme',
            'creative strategy', 'digital assets', 'video', 'ai', 'tech',
            'channels', 'mediums'
        ]
        
        line_lower = line.lower()
        return any(keyword in line_lower for keyword in header_keywords)
    
    def _normalize_header(self, header: str) -> str:
        """Normalizes header text for matching"""
        return header.replace('**', '').replace('#', '').strip()
    
    def _extract_section_content(self, section_title: str, content_map: dict, full_content: str, research_data: dict) -> str:
        """Extracts or generates content for a specific section"""
        
        # Try to find matching content in the generated brief
        section_content = self._find_matching_content(section_title, content_map)
        
        # If no content found, generate based on research data and section type
        if not section_content:
            section_content = self._generate_section_content(section_title, research_data)
        
        # Format as HTML
        return self._format_content_as_html(section_content)
    
    def _find_matching_content(self, target_title: str, content_map: dict) -> str:
        """Finds content that matches the target section title"""
        
        target_lower = target_title.lower()
        
        # Direct keyword matching
        for header, content in content_map.items():
            header_lower = header.lower()
            
            # Check for direct matches or key phrase matches
            if self._titles_match(target_lower, header_lower):
                return content
        
        return ""
    
    def _titles_match(self, target: str, header: str) -> bool:
        """Checks if titles match based on key phrases"""
        
        # Define matching patterns
        match_patterns = {
            'business objective': ['business', 'objective'],
            'marketing objective': ['marketing', 'objective'],
            'background': ['background', 'context'],
            'target audience': ['target', 'audience', 'persona'],
            'problem we are trying to solve': ['problem', 'solve', 'trying'],
            'challenges': ['challenge', 'obstacles'],
            'solutions/offering': ['solution', 'offering', 'product'],
            'why xyz (platform)': ['why', 'platform', 'edgeverve'],
            'why does enterprise need': ['enterprise', 'need'],
            'market trend and demand': ['market', 'trend', 'demand'],
            'statement of work': ['statement', 'work', 'sow'],
            'key messages across levels': ['message', 'level', 'l1', 'l2'],
            'campaign theme': ['campaign', 'theme', 'creative', 'strategy'],
            'digital assets': ['digital', 'assets', 'banner', 'microsite'],
            'digital campaign videos': ['video', 'campaign'],
            'ai / tech enabled ideas': ['ai', 'tech', 'enabled', 'ideas'],
            'channels / campaign digital mediums': ['channel', 'mediums', 'digital']
        }
        
        # Find matching pattern
        for pattern_key, keywords in match_patterns.items():
            if pattern_key in target:
                # Check if header contains most of the keywords
                matches = sum(1 for keyword in keywords if keyword in header)
                if matches >= len(keywords) // 2:  # At least half the keywords match
                    return True
        
        return False
    
    def _generate_section_content(self, section_title: str, research_data: dict) -> str:
        """Generates content for sections based on research data"""
        
        title_lower = section_title.lower()
        
        if 'business objective' in title_lower:
            return "Establish EdgeVerve as the leading provider of Applied AI solutions for enterprises, targeting 15% market share increase and $50M ARR growth within 12 months."
        
        elif 'marketing objective' in title_lower:
            return """1. **Platform Brand Awareness:** Increase EdgeVerve brand recognition among enterprise CIOs by 40%
2. **Lead Generation:** Generate 500+ qualified enterprise leads quarterly
3. **Thought Leadership:** Position EdgeVerve as the go-to expert in enterprise AI implementation"""
        
        elif 'background' in title_lower:
            return "EdgeVerve operates in the rapidly growing enterprise AI market, serving large corporations ($1B-$5B revenue) seeking to scale AI beyond experimentation. The market demands unified platforms that can democratize AI across organizations while maintaining enterprise-grade security and governance."
        
        elif 'target audience' in title_lower:
            audience_data = research_data.get('audience_insights', {})
            demographics = audience_data.get('demographic_profile', {})
            return f"""**Primary Audience:** CIOs and CIO-1 of large enterprises
**Demographics:** {demographics.get('age_range', '35-55 years')}, {demographics.get('education_level', 'Graduate degree')}, {demographics.get('income_range', '$150K-$300K')}
**Company Profile:** $1B-$5B revenue companies in financial services, healthcare, and manufacturing
**Pain Points:** {', '.join(audience_data.get('pain_points', ['AI scaling challenges', 'Data silos', 'Legacy integration'])[:3])}"""
        
        elif 'problem we are trying to solve' in title_lower:
            return "Enterprise organizations struggle to scale AI initiatives beyond proof-of-concept stage due to fragmented systems, data silos, lack of governance frameworks, and insufficient technical expertise to implement enterprise-grade AI solutions."
        
        elif 'challenges' in title_lower:
            return """• **Technical Complexity:** Integrating AI with existing enterprise systems
• **Data Fragmentation:** Siloed data across departments and systems  
• **Governance & Compliance:** Ensuring AI solutions meet regulatory requirements
• **Skills Gap:** Lack of internal AI expertise and resources
• **ROI Uncertainty:** Difficulty demonstrating clear business value from AI investments"""
        
        elif 'solutions/offering' in title_lower:
            return """**EdgeVerve AI Platform Features:**
• **PolyAI Technology:** Multi-model flexibility and vendor-agnostic approach
• **Enterprise Integration:** Seamless connection with existing systems and workflows
• **Built-in Governance:** Comprehensive AI ethics, compliance, and monitoring frameworks
• **Cloud-Agnostic Deployment:** Works across AWS, Azure, GCP, and hybrid environments
• **AI Democratization:** No-code/low-code tools for business users"""
        
        elif 'why' in title_lower and 'platform' in title_lower:
            return """• **Proven Enterprise Focus:** Purpose-built for large organization requirements
• **Rapid ROI:** 6-month average time to value vs. 18+ months for custom solutions
• **Scalable Architecture:** Handles enterprise-scale data and user volumes
• **Security First:** Built-in enterprise-grade security and compliance features
• **Innovation Speed:** Continuous platform updates and latest AI model integration
• **Expert Support:** Dedicated enterprise success and technical support teams"""
        
        elif 'enterprise need' in title_lower:
            return "Modern enterprises require AI solutions that can scale across the organization, integrate with existing infrastructure, comply with regulatory requirements, and deliver measurable business outcomes while democratizing AI access across different skill levels and departments."
        
        elif 'market trend' in title_lower:
            trends_data = research_data.get('market_trends', {})
            industry_trends = trends_data.get('industry_trends', {})
            return f"""**Market Growth:** {industry_trends.get('growth_rate', '+67% YoY')}
**Rising Demand:** {', '.join(industry_trends.get('rising_searches', ['Enterprise AI platforms +156%', 'MLOps solutions +134%'])[:3])}
**Key Trends:** {', '.join(industry_trends.get('hot_topics', ['Generative AI for enterprise', 'AI governance', 'Federated learning'])[:4])}
**Investment Focus:** Enterprise AI platforms expected to reach $50B market size by 2025"""
        
        elif 'statement of work' in title_lower:
            return """**Phase 1:** Brand positioning and messaging framework (4 weeks)
**Phase 2:** Multi-channel campaign development and asset creation (6 weeks)  
**Phase 3:** Campaign launch and optimization (8 weeks)
**Phase 4:** Performance analysis and scaling (4 weeks)
**Deliverables:** Brand guidelines, campaign assets, content library, performance dashboard"""
        
        elif 'key messages' in title_lower:
            return """**L1 (Executive):** "Transform your enterprise with unified AI that scales"
**L2 (Technical Leaders):** "Enterprise-grade AI platform with built-in governance and security"
**L3 (IT Teams):** "Seamlessly integrate AI across your existing infrastructure"
**L4 (Business Users):** "Democratize AI with no-code tools that deliver real business value" """
        
        elif 'campaign theme' in title_lower:
            return """**Theme:** "AI That Scales, Secures, and Succeeds"
**Approach:** Executive-focused thought leadership combined with technical proof points
**Creative Strategy:** Position EdgeVerve as the bridge between AI innovation and enterprise reality
**Key Pillars:** Trust, Scale, Innovation, Results
**Tone:** Professional, confident, results-oriented with human-centered AI messaging"""
        
        elif 'digital assets' in title_lower:
            return """**Banners:** Executive-focused LinkedIn/Google Ads (5 sizes)
**Microsite:** Interactive AI ROI calculator and platform demo
**Infographics:** AI implementation roadmap, ROI comparison charts
**Email Designs:** Executive briefing templates, technical deep-dive series
**Interactive Tools:** AI readiness assessment, implementation timeline calculator"""
        
        elif 'video' in title_lower:
            return """**Executive Testimonials:** C-level customers sharing transformation stories (2-3 min)
**Platform Demos:** Technical walkthroughs and use case demonstrations (5-7 min)
**Thought Leadership:** Industry expert interviews and trend analysis (3-5 min)
**Case Study Videos:** Real customer implementation journeys (4-6 min)
**Social Media Clips:** Quick wins and key insights for LinkedIn (30-60 sec)"""
        
        elif 'ai / tech enabled' in title_lower:
            return """**AI-Powered Personalization:** Dynamic content adaptation based on visitor profile and industry
**Predictive Lead Scoring:** ML-driven qualification and nurturing recommendations
**Intelligent Chatbots:** Industry-specific AI assistants for technical questions
**Dynamic ROI Calculators:** Real-time business impact modeling
**Automated Content Generation:** Personalized case studies and implementation guides"""
        
        elif 'channels' in title_lower or 'mediums' in title_lower:
            audience_data = research_data.get('audience_insights', {})
            channel_prefs = audience_data.get('channel_preferences', {})
            return f"""**Primary Channels:** {', '.join(channel_prefs.get('primary_channels', ['LinkedIn', 'Industry Publications', 'Google Ads']))}
**Secondary Channels:** {', '.join(channel_prefs.get('secondary_channels', ['YouTube', 'Webinars', 'Email']))}
**Content Distribution:** Thought leadership articles, technical whitepapers, interactive demos
**Engagement Strategy:** Account-based marketing for top 100 enterprise prospects
**Measurement:** Pipeline influence, engagement scores, brand lift studies"""
        
        else:
            return f"Content for {section_title} will be developed based on stakeholder requirements and market research insights."
    
    def _format_content_as_html(self, content: str) -> str:
        """Formats content as HTML"""
        
        if not content:
            return "Content to be developed based on stakeholder requirements."
        
        # Replace markdown-style formatting
        content = content.replace('**', '<strong>').replace('**', '</strong>')
        
        # Handle bullet points
        lines = content.split('\n')
        formatted_lines = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if line.startswith('- ') or line.startswith('* '):
                line = f"• {line[2:]}"
            elif line.startswith('• '):
                # Already formatted
                pass
            elif line.startswith('1.') or line.startswith('2.') or line.startswith('3.'):
                line = f"<strong>{line}</strong>"
            
            formatted_lines.append(line)
        
        # Join with <br> tags
        html_content = '<br>'.join(formatted_lines)
        
        # Clean up extra formatting
        html_content = html_content.replace('<strong><strong>', '<strong>')
        html_content = html_content.replace('</strong></strong>', '</strong>')
        
        return html_content

@app.route('/generate-brief', methods=['POST'])
def generate_brief():
    """Endpoint to generate creative brief"""
    
    try:
        # Get request data (optional parameters)
        request_data = request.get_json() if request.is_json else {}
        
        # Configuration
        GEMINI_API_KEY = "AIzaSyDXSjIm0Ylet1aDnPw-oUbqpTzniOeHSpQ"
        SERPER_API_KEY = "4c31090113c4a9798844f3eca1e494363e13f0f3"  # 
        
        # Create demo instance
        demo = HackathonDemo(GEMINI_API_KEY, SERPER_API_KEY)
        
        print("🚀 Generating EdgeVerve AI Platform Brief via API...")
        
        # Run the demo (this is async, so we need to handle it properly)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(demo.run_demo())
        finally:
            loop.close()
        
        # Format the result
        formatter = BriefFormatter()
        formatted_sections = formatter.parse_brief_content(
            result["brief_content"], 
            result["research_data"]
        )
        
        # Return formatted response
        response = {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "sections": formatted_sections,
            "metadata": {
                "research_time": result["generation_metadata"]["research_time_seconds"],
                "agents_used": result["generation_metadata"]["agents_used"],
                "total_sections": len(formatted_sections)
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"Error generating brief: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "EdgeVerve AI Brief Generator",
        "timestamp": datetime.now().isoformat()
    }), 200

@app.route('/brief-preview', methods=['GET'])
def brief_preview():
    """Preview endpoint that returns sample formatted sections in the required order"""
    
    sample_sections = [
        {
            "id": 1,
            "icon": "🎯",
            "title": "Business Objective",
            "content": "<strong>Primary Goal:</strong> Establish EdgeVerve as the leading provider of Applied AI solutions for enterprises<br><strong>Target Market:</strong> Large enterprises ($1B-$5B revenue) in financial, healthcare, and manufacturing sectors<br><strong>Success Metrics:</strong> 15% market share increase, $50M ARR growth, 500+ enterprise customers within 12 months",
            "type": "text"
        },
        {
            "id": 2,
            "icon": "📈",
            "title": "Marketing Objective",
            "content": "<strong>1. Platform Brand Awareness:</strong> Increase EdgeVerve brand recognition among enterprise CIOs by 40%<br><strong>2. Lead Generation:</strong> Generate 500+ qualified enterprise leads quarterly<br><strong>3. Thought Leadership:</strong> Position EdgeVerve as the go-to expert in enterprise AI implementation and governance",
            "type": "text"
        },
        {
            "id": 3,
            "icon": "📋",
            "title": "Background",
            "content": "EdgeVerve operates in the rapidly growing enterprise AI market, serving large corporations ($1B-$5B revenue) seeking to scale AI beyond experimentation. The market demands unified platforms that can democratize AI across organizations while maintaining enterprise-grade security and governance.<br><strong>Market Size:</strong> $50B by 2025<br><strong>Growth Rate:</strong> 67% YoY",
            "type": "text"
        },
        {
            "id": 4,
            "icon": "👥",
            "title": "Target Audience",
            "content": "<strong>Primary Audience:</strong> CIOs and CIO-1 of large enterprises<br><strong>Demographics:</strong> 35-55 years, Graduate degree, $150K-$300K income<br><strong>Company Profile:</strong> $1B-$5B revenue companies in financial services, healthcare, and manufacturing<br><strong>Pain Points:</strong> AI scaling challenges, Data silos, Legacy integration, Governance concerns",
            "type": "text"
        },
        {
            "id": 5,
            "icon": "❗",
            "title": "The Problem we are trying to solve",
            "content": "Enterprise organizations struggle to scale AI initiatives beyond proof-of-concept stage due to fragmented systems, data silos, lack of governance frameworks, and insufficient technical expertise to implement enterprise-grade AI solutions that deliver measurable business value.",
            "type": "text"
        },
        {
            "id": 6,
            "icon": "⚠️",
            "title": "What are the challenges?",
            "content": "• <strong>Technical Complexity:</strong> Integrating AI with existing enterprise systems<br>• <strong>Data Fragmentation:</strong> Siloed data across departments and systems<br>• <strong>Governance & Compliance:</strong> Ensuring AI solutions meet regulatory requirements<br>• <strong>Skills Gap:</strong> Lack of internal AI expertise and resources<br>• <strong>ROI Uncertainty:</strong> Difficulty demonstrating clear business value",
            "type": "text"
        },
        {
            "id": 7,
            "icon": "💡",
            "title": "Solutions/Offering",
            "content": "<strong>EdgeVerve AI Platform Features:</strong><br>• <strong>PolyAI Technology:</strong> Multi-model flexibility and vendor-agnostic approach<br>• <strong>Enterprise Integration:</strong> Seamless connection with existing systems<br>• <strong>Built-in Governance:</strong> Comprehensive AI ethics and compliance frameworks<br>• <strong>Cloud-Agnostic Deployment:</strong> Works across AWS, Azure, GCP<br>• <strong>AI Democratization:</strong> No-code/low-code tools for business users",
            "type": "text"
        },
        {
            "id": 8,
            "icon": "🚀",
            "title": "Why EdgeVerve (Platform)?",
            "content": "• <strong>Proven Enterprise Focus:</strong> Purpose-built for large organization requirements<br>• <strong>Rapid ROI:</strong> 6-month average time to value vs. 18+ months for custom solutions<br>• <strong>Scalable Architecture:</strong> Handles enterprise-scale data and user volumes<br>• <strong>Security First:</strong> Built-in enterprise-grade security and compliance<br>• <strong>Innovation Speed:</strong> Continuous platform updates and latest AI model integration",
            "type": "text"
        },
        {
            "id": 9,
            "icon": "🏢",
            "title": "Why does Enterprise need this solution?",
            "content": "Modern enterprises require AI solutions that can scale across the organization, integrate with existing infrastructure, comply with regulatory requirements, and deliver measurable business outcomes while democratizing AI access across different skill levels and departments.",
            "type": "text"
        },
        {
            "id": 10,
            "icon": "�",
            "title": "Present market trend and demand",
            "content": "<strong>Market Growth:</strong> +67% YoY<br><strong>Rising Demand:</strong> Enterprise AI platforms +156%, MLOps solutions +134%, AI governance +89%<br><strong>Key Trends:</strong> Generative AI for enterprise, AI governance, Federated learning, Responsible AI<br><strong>Investment Focus:</strong> Enterprise AI platforms expected to reach $50B market size by 2025",
            "type": "text"
        },
        {
            "id": 11,
            "icon": "📋",
            "title": "Agency Statement of Work (SOW)",
            "content": "<strong>Phase 1:</strong> Brand positioning and messaging framework (4 weeks)<br><strong>Phase 2:</strong> Multi-channel campaign development and asset creation (6 weeks)<br><strong>Phase 3:</strong> Campaign launch and optimization (8 weeks)<br><strong>Phase 4:</strong> Performance analysis and scaling (4 weeks)<br><strong>Deliverables:</strong> Brand guidelines, campaign assets, content library, performance dashboard",
            "type": "text"
        },
        {
            "id": 12,
            "icon": "🎯",
            "title": "Key messages across Levels (L1 to L4)",
            "content": "<strong>L1 (Executive):</strong> Transform your enterprise with unified AI that scales<br><strong>L2 (Technical Leaders):</strong> Enterprise-grade AI platform with built-in governance and security<br><strong>L3 (IT Teams):</strong> Seamlessly integrate AI across your existing infrastructure<br><strong>L4 (Business Users):</strong> Democratize AI with no-code tools that deliver real business value",
            "type": "text"
        },
        {
            "id": 13,
            "icon": "�",
            "title": "Campaign Theme, Approach/Outline/Creative Strategy",
            "content": "<strong>Theme:</strong> AI That Scales, Secures, and Succeeds<br><strong>Approach:</strong> Executive-focused thought leadership combined with technical proof points<br><strong>Creative Strategy:</strong> Position EdgeVerve as the bridge between AI innovation and enterprise reality<br><strong>Key Pillars:</strong> Trust, Scale, Innovation, Results<br><strong>Tone:</strong> Professional, confident, results-oriented",
            "type": "text"
        },
        {
            "id": 14,
            "icon": "🖼️",
            "title": "Digital Assets (Banners, Microsite, Infographics, Email Designs)",
            "content": "<strong>Banners:</strong> Executive-focused LinkedIn/Google Ads (5 standard sizes)<br><strong>Microsite:</strong> Interactive AI ROI calculator and platform demo<br><strong>Infographics:</strong> AI implementation roadmap, ROI comparison charts<br><strong>Email Designs:</strong> Executive briefing templates, technical deep-dive series<br><strong>Interactive Tools:</strong> AI readiness assessment, implementation timeline calculator",
            "type": "text"
        },
        {
            "id": 15,
            "icon": "🎬",
            "title": "Digital Campaign Videos",
            "content": "<strong>Executive Testimonials:</strong> C-level customers sharing transformation stories (2-3 min)<br><strong>Platform Demos:</strong> Technical walkthroughs and use case demonstrations (5-7 min)<br><strong>Thought Leadership:</strong> Industry expert interviews and trend analysis (3-5 min)<br><strong>Case Study Videos:</strong> Real customer implementation journeys (4-6 min)<br><strong>Social Media Clips:</strong> Quick wins and key insights for LinkedIn (30-60 sec)",
            "type": "text"
        },
        {
            "id": 16,
            "icon": "🤖",
            "title": "AI / Tech Enabled Ideas",
            "content": "<strong>AI-Powered Personalization:</strong> Dynamic content adaptation based on visitor profile and industry<br><strong>Predictive Lead Scoring:</strong> ML-driven qualification and nurturing recommendations<br><strong>Intelligent Chatbots:</strong> Industry-specific AI assistants for technical questions<br><strong>Dynamic ROI Calculators:</strong> Real-time business impact modeling<br><strong>Automated Content Generation:</strong> Personalized case studies and implementation guides",
            "type": "text"
        },
        {
            "id": 17,
            "icon": "📱",
            "title": "Channels / Campaign Digital Mediums",
            "content": "<strong>Primary Channels:</strong> LinkedIn sponsored content, Industry publications, Google Ads<br><strong>Secondary Channels:</strong> YouTube demos, Webinar series, Email sequences<br><strong>Content Distribution:</strong> Thought leadership articles, technical whitepapers, interactive demos<br><strong>Engagement Strategy:</strong> Account-based marketing for top 100 enterprise prospects<br><strong>Measurement:</strong> Pipeline influence, engagement scores, brand lift studies",
            "type": "text"
        }
    ]
    
    return jsonify({
        "success": True,
        "preview": True,
        "timestamp": datetime.now().isoformat(),
        "sections": sample_sections,
        "metadata": {
            "total_sections": len(sample_sections),
            "sample_data": True,
            "structure": "Required 17-section format maintained"
        }
    }), 200

if __name__ == '__main__':
    print("🚀 Starting EdgeVerve AI Brief Generator API Server...")
    print("📍 Available endpoints:")
    print("   POST /generate-brief - Generate full creative brief")
    print("   GET  /brief-preview  - Get sample formatted sections")
    print("   GET  /health        - Health check")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
