
import asyncio
import json
import requests
from typing import Dict, List, Any
from datetime import datetime
import google.generativeai as genai
from pdf_brief_generator import generate_pdf_from_brief

# =============================================================================
# 1. RESEARCH AGENTS - Simple but Effective
# =============================================================================

class CompetitorResearchAgent:
    """Agent that automatically researches competitors"""
    
    def __init__(self, serper_api_key: str = None):
        self.serper_api_key = serper_api_key
    
    async def research_competitors(self, industry: str, company_type: str) -> Dict:
        """Researches top competitors in the industry"""
        
        # For demo: simulated data + optional real search
        if self.serper_api_key:
            competitors = await self._search_real_competitors(industry, company_type)
        else:
            competitors = self._get_simulated_competitors(industry, company_type)
        
        return {
            "top_competitors": competitors,
            "market_positioning": self._analyze_positioning(competitors),
            "pricing_insights": self._analyze_pricing(competitors),
            "messaging_patterns": self._analyze_messaging(competitors),
            "timestamp": datetime.now().isoformat()
        }
    
    async def _search_real_competitors(self, industry: str, company_type: str) -> List[Dict]:
        """Real search using Serper API"""
        url = "https://google.serper.dev/search"
        headers = {
            "X-API-KEY": self.serper_api_key,
            "Content-Type": "application/json"
        }
        
        query = f"top {company_type} companies {industry} 2024"
        payload = {"q": query, "num": 5}
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            results = response.json()
            
            competitors = []
            for result in results.get("organic", [])[:3]:
                competitors.append({
                    "name": result.get("title", "").split(" ")[0],
                    "description": result.get("snippet", ""),
                    "website": result.get("link", ""),
                    "source": "serper_search"
                })
            return competitors
        except Exception as e:
            print(f"Error in real search: {e}")
            return self._get_simulated_competitors(industry, company_type)
    
    def _get_simulated_competitors(self, industry: str, company_type: str) -> List[Dict]:
        """Simulated data for demo"""
        competitor_db = {
            "enterprise_ai": {
                "ai_platform": [
                    {"name": "Databricks", "pricing": "Custom enterprise", "focus": "Unified analytics platform"},
                    {"name": "Palantir", "pricing": "$2M+ annually", "focus": "Enterprise data integration"},
                    {"name": "DataRobot", "pricing": "$100K+ annually", "focus": "Automated machine learning"},
                    {"name": "H2O.ai", "pricing": "Custom", "focus": "Open source ML platform"},
                    {"name": "Microsoft Azure AI", "pricing": "Pay-per-use", "focus": "Cloud-native AI services"}
                ]
            }
        }
        
        return competitor_db.get(industry, {}).get(company_type, [
            {"name": "IBM Watson", "pricing": "Enterprise", "focus": "AI consulting"},
            {"name": "Salesforce Einstein", "pricing": "Add-on pricing", "focus": "CRM AI"},
            {"name": "AWS SageMaker", "pricing": "Pay-per-use", "focus": "ML platform"}
        ])
    
    def _analyze_positioning(self, competitors: List[Dict]) -> Dict:
        """Analyzes competitors' positioning"""
        positions = [comp.get("focus", "") for comp in competitors]
        return {
            "common_positions": list(set(positions)),
            "gap_opportunities": ["HIPAA-first approach", "AI-powered insights", "Mobile-first design"],
            "differentiation_suggestion": "Focus on automation and time-saving for busy professionals"
        }
    
    def _analyze_pricing(self, competitors: List[Dict]) -> Dict:
        """Analyzes pricing patterns"""
        prices = [comp.get("pricing", "") for comp in competitors]
        return {
            "pricing_models": ["Subscription", "Per-user", "Custom enterprise"],
            "price_range": "Free to $149/month",
            "recommendation": "Position at $49-79/month for competitive advantage"
        }
    
    def _analyze_messaging(self, competitors: List[Dict]) -> Dict:
        """Analyzes messaging patterns"""
        return {
            "common_themes": ["Efficiency", "Integration", "User-friendly"],
            "missing_angles": ["Sustainability", "Work-life balance", "Mental health"],
            "tone_analysis": "Professional but approachable, benefit-focused"
        }

class TrendsResearchAgent:
    """Agent that analyzes market trends"""
    
    def __init__(self, google_trends_api_key: str = None):
        self.api_key = google_trends_api_key
    
    async def analyze_trends(self, industry: str, audience: str, timeframe: str = "12m") -> Dict:
        """Analyzes relevant trends for industry and audience"""
        
        # For demo: combines simulated real data with insights
        trends_data = {
            "industry_trends": self._get_industry_trends(industry),
            "audience_trends": self._get_audience_trends(audience),
            "seasonal_patterns": self._get_seasonal_patterns(industry),
            "emerging_topics": self._get_emerging_topics(industry, audience),
            "timestamp": datetime.now().isoformat()
        }
        
        return trends_data
    
    def _get_industry_trends(self, industry: str) -> Dict:
        """Industry-specific trends"""
        industry_data = {
            "enterprise_ai": {
                "rising_searches": ["enterprise AI platform +156%", "MLOps solutions +134%", "AI governance +89%", "multi-model AI +78%"],
                "declining_searches": ["on-premise analytics -34%", "single-model solutions -28%"],
                "hot_topics": ["Generative AI for enterprise", "AI model governance", "Federated learning", "Responsible AI", "AI democratization"],
                "growth_rate": "+67% YoY"
            }
        }
        
        return industry_data.get(industry, {
            "rising_searches": ["enterprise AI platform +156%", "MLOps solutions +134%"],
            "hot_topics": ["AI governance", "Multi-model AI", "Enterprise automation"],
            "growth_rate": "+67% YoY"
        })
    
    def _get_audience_trends(self, audience: str) -> Dict:
        """Audience-specific trends"""
        # Analyzes keywords in audience description
        if "cio" in audience.lower() or "chief information" in audience.lower():
            return {
                "search_patterns": ["enterprise AI platforms", "digital transformation ROI", "AI governance frameworks"],
                "content_preferences": ["Analyst reports", "Executive briefings", "ROI case studies"],
                "peak_hours": ["Tuesday-Thursday 9-11 AM", "Wednesday 2-4 PM"],
                "device_usage": "75% desktop, 25% mobile"
            }
        elif "professional" in audience.lower() or "business" in audience.lower():
            return {
                "search_patterns": ["efficiency tools", "productivity apps", "work-life balance"],
                "content_preferences": ["Video tutorials", "Case studies", "ROI calculators"],
                "peak_hours": ["Tuesday-Thursday 9-11 AM", "Monday 2-4 PM"],
                "device_usage": "68% mobile, 32% desktop"
            }
        else:
            return {
                "search_patterns": ["enterprise solutions", "technology platforms", "business automation"],
                "content_preferences": ["Whitepapers", "Product demos", "Industry reports"],
                "peak_hours": ["Weekdays 9 AM-5 PM"],
                "device_usage": "70% desktop, 30% mobile"
            }
    
    def _get_seasonal_patterns(self, industry: str) -> Dict:
        """Seasonal search patterns"""
        return {
            "q1": "High search volume for 'new year productivity tools'",
            "q2": "Peak season for B2B software purchases",
            "q3": "Summer lull, focus on maintenance and training",
            "q4": "Budget planning season, enterprise deals",
            "best_launch_timing": "Q1 or Q2 for maximum impact"
        }
    
    def _get_emerging_topics(self, industry: str, audience: str) -> List[str]:
        """Relevant emerging topics"""
        base_topics = ["AI integration", "Mobile-first design", "Data privacy"]
        
        if "healthcare" in (industry + audience).lower():
            base_topics.extend(["Telehealth integration", "Patient engagement", "Clinical workflow automation"])
        
        if "professional" in audience.lower():
            base_topics.extend(["Productivity optimization", "Remote work solutions", "Team collaboration"])
        
        return base_topics

class AudienceResearchAgent:
    """Agent that enriches audience data"""
    
    def __init__(self):
        self.demographic_db = self._load_demographic_database()
    
    async def enrich_audience(self, basic_audience: str, industry: str) -> Dict:
        """Enriches basic audience description with demographic and behavioral data"""
        
        enriched_data = {
            "demographic_profile": self._analyze_demographics(basic_audience),
            "behavioral_insights": self._get_behavioral_insights(basic_audience, industry),
            "channel_preferences": self._get_channel_preferences(basic_audience),
            "content_consumption": self._get_content_preferences(basic_audience),
            "pain_points": self._identify_pain_points(basic_audience, industry),
            "buying_journey": self._map_buying_journey(basic_audience, industry),
            "timestamp": datetime.now().isoformat()
        }
        
        return enriched_data
    
    def _load_demographic_database(self) -> Dict:
        """Simulated demographic database"""
        return {
            "healthcare_professionals": {
                "age_range": "28-55",
                "income": "$75K-$250K",
                "education": "Graduate degree",
                "tech_adoption": "Moderate to high",
                "work_schedule": "Long hours, high stress"
            },
            "small_business_owners": {
                "age_range": "25-50",
                "income": "$50K-$150K",
                "education": "Bachelor's degree",
                "tech_adoption": "Moderate",
                "work_schedule": "Flexible but demanding"
            },
            "professional_women": {
                "age_range": "25-45",
                "income": "$60K-$120K",
                "education": "Bachelor's or higher",
                "tech_adoption": "High",
                "work_schedule": "Work-life balance focused"
            }
        }
    
    def _analyze_demographics(self, audience: str) -> Dict:
        """Analyzes and enriches demographic data"""
        # Simple keyword matching for demo
        for key, data in self.demographic_db.items():
            if any(word in audience.lower() for word in key.split('_')):
                return {
                    "primary_segment": key.replace('_', ' ').title(),
                    "age_range": data["age_range"],
                    "income_range": data["income"],
                    "education_level": data["education"],
                    "tech_adoption_rate": data["tech_adoption"],
                    "work_lifestyle": data["work_schedule"]
                }
        
        return {
            "primary_segment": "General Professional",
            "age_range": "25-50",
            "income_range": "$50K-$100K",
            "education_level": "College educated",
            "tech_adoption_rate": "Moderate to high"
        }
    
    def _get_behavioral_insights(self, audience: str, industry: str) -> Dict:
        """Behavioral insights"""
        return {
            "decision_making": "Research-driven, seeks peer validation",
            "purchase_triggers": ["Time savings", "ROI demonstration", "Peer recommendations"],
            "objections": ["Cost concerns", "Implementation time", "Learning curve"],
            "preferred_communication": "Email and professional networks",
            "trust_factors": ["Industry certifications", "Case studies", "Free trials"]
        }
    
    def _get_channel_preferences(self, audience: str) -> Dict:
        """Channel preferences"""
        if "healthcare" in audience.lower():
            return {
                "primary_channels": ["LinkedIn", "Medical journals", "Industry conferences"],
                "secondary_channels": ["Email newsletters", "Webinars", "Peer networks"],
                "avoid_channels": ["TikTok", "Snapchat", "General social media"],
                "engagement_times": "Weekdays 7-9 AM, 6-8 PM"
            }
        elif "professional" in audience.lower():
            return {
                "primary_channels": ["LinkedIn", "Industry publications", "Professional networks"],
                "secondary_channels": ["Email", "Instagram", "Podcasts"],
                "avoid_channels": ["Facebook", "TikTok"],
                "engagement_times": "Weekdays 8-10 AM, 5-7 PM"
            }
        else:
            return {
                "primary_channels": ["Google Search", "Social media", "Email"],
                "secondary_channels": ["YouTube", "Blogs", "Reviews"],
                "engagement_times": "Evenings and weekends"
            }
    
    def _get_content_preferences(self, audience: str) -> Dict:
        """Content preferences"""
        return {
            "preferred_formats": ["Case studies", "How-to guides", "Video demos"],
            "content_length": "3-5 minute videos, 800-1200 word articles",
            "tone_preference": "Professional but approachable",
            "information_depth": "Detailed with actionable insights",
            "social_proof": "Peer testimonials and industry endorsements"
        }
    
    def _identify_pain_points(self, audience: str, industry: str) -> List[str]:
        """Identifies specific pain points"""
        base_pain_points = ["Time constraints", "Budget limitations", "Technology complexity"]
        
        if "healthcare" in (audience + industry).lower():
            base_pain_points.extend([
                "HIPAA compliance requirements",
                "Patient data security concerns",
                "Integration with existing EMR systems",
                "Workflow disruption during implementation"
            ])
        
        if "professional" in audience.lower():
            base_pain_points.extend([
                "Work-life balance challenges",
                "Information overload",
                "Need for efficiency improvements"
            ])
        
        return base_pain_points
    
    def _map_buying_journey(self, audience: str, industry: str) -> Dict:
        """Maps the buying journey"""
        return {
            "awareness_stage": {
                "duration": "2-4 weeks",
                "content_needs": ["Problem identification", "Industry trends", "Best practices"],
                "channels": ["Google search", "Industry publications", "Peer networks"]
            },
            "consideration_stage": {
                "duration": "4-8 weeks",
                "content_needs": ["Solution comparison", "ROI calculators", "Case studies"],
                "channels": ["Vendor websites", "Reviews", "Demos"]
            },
            "decision_stage": {
                "duration": "2-6 weeks",
                "content_needs": ["Pricing", "Implementation support", "References"],
                "channels": ["Sales calls", "Free trials", "Peer recommendations"]
            }
        }

# =============================================================================
# 2. ORCHESTRATOR - LangChain Workflow
# =============================================================================

class AgenticBriefOrchestrator:
    """Main orchestrator that coordinates all agents"""
    
    def __init__(self, gemini_api_key: str, serper_api_key: str = None):
        self.llm = "gemini-2.0-flash"
        genai.configure(api_key=gemini_api_key)
        self.client = genai.GenerativeModel(self.llm)
        
        # Initialize agents
        self.competitor_agent = CompetitorResearchAgent(serper_api_key)
        self.trends_agent = TrendsResearchAgent()
        self.audience_agent = AudienceResearchAgent()
        
        # Your original template (placeholder - replace with yours)
        self.original_template = self._load_original_template()
    
    def _load_original_template(self) -> str:
        """Enhanced creative brief template with required sections in exact order"""
        return """
        Generate a comprehensive creative brief for EdgeVerve AI Platform following the EXACT structure below. 
        Each section must be clearly labeled with the exact title shown and contain detailed, actionable content.

        **REQUIRED BRIEF STRUCTURE - MAINTAIN THIS EXACT ORDER:**

        **Business Objective**
        [Define the primary business goal, target metrics, and success criteria for EdgeVerve AI Platform]

        **Marketing Objective**
        1. **Platform Brand Awareness:** [Specific awareness goals and metrics]
        2. **Lead Generation:** [Lead targets and qualification criteria]
        3. **Thought Leadership:** [Positioning and expertise goals]

        **Background**
        [Company context, market position, and industry landscape for enterprise AI platforms]

        **Target Audience**
        [Detailed profiles of CIOs, CIO-1, and decision makers in enterprise organizations]

        **The Problem we are trying to solve**
        [Core challenges that EdgeVerve AI Platform addresses for enterprise customers]

        **What are the challenges?**
        [Specific obstacles and pain points facing enterprise AI adoption]

        **Solutions/Offering**
        [Detailed description of EdgeVerve platform features, capabilities, and value propositions]

        **Why EdgeVerve (Platform)?**
        [Compelling reasons why EdgeVerve is the best choice over competitors]

        **Why does Enterprise need this solution?**
        [Business case for enterprise AI platform adoption from organizational perspective]

        **Present market trend and demand**
        [Current market dynamics, growth trends, and demand drivers in enterprise AI]

        **Agency Statement of Work (SOW)**
        [Specific deliverables, timelines, and scope of work for campaign execution]

        **Key messages across Levels (L1 to L4)**
        [Hierarchical messaging framework from executive to technical audiences]

        **Campaign Theme, Approach/Outline/Creative Strategy**
        [Overarching campaign concept, creative direction, and strategic approach]

        **Digital Assets (Banners, Microsite, Infographics, Email Designs)**
        [Specific digital asset requirements and specifications]

        **Digital Campaign Videos**
        [Video content strategy, types, and production requirements]

        **AI / Tech Enabled Ideas**
        [Innovative technology-driven campaign elements and personalization strategies]

        **Channels / Campaign Digital Mediums**
        [Complete channel strategy with primary, secondary, and supporting mediums]

        CRITICAL REQUIREMENTS:
        - Use the EXACT section titles as shown above
        - Provide substantial content for each section (minimum 3-4 sentences)
        - Include specific metrics, timelines, and actionable details
        - Reference the research data provided to enhance each section
        - Maintain professional B2B enterprise tone throughout
        - Replace any generic references with EdgeVerve-specific content
        """
    
    async def generate_enhanced_brief(self, stakeholder_inputs: Dict) -> Dict:
        """Main process that generates enhanced brief with automatic research"""
        
        print("🤖 Starting agentic research...")
        start_time = datetime.now()
        
        # 1. Automatic research in parallel
        research_tasks = [
            self.competitor_agent.research_competitors(
                stakeholder_inputs.get("industry", "technology"),
                stakeholder_inputs.get("company_type", "software")
            ),
            self.trends_agent.analyze_trends(
                stakeholder_inputs.get("industry", "technology"),
                stakeholder_inputs.get("target_audience", "professionals")
            ),
            self.audience_agent.enrich_audience(
                stakeholder_inputs.get("target_audience", "professionals"),
                stakeholder_inputs.get("industry", "technology")
            )
        ]
        
        # Run research in parallel
        competitor_research, trends_research, audience_research = await asyncio.gather(*research_tasks)
        
        research_time = (datetime.now() - start_time).total_seconds()
        print(f"✅ Research completed in {research_time:.2f} seconds")
        
        # 2. Consolidate research findings
        consolidated_research = {
            "competitor_analysis": competitor_research,
            "market_trends": trends_research,
            "audience_insights": audience_research
        }
        
        # 3. Generate enhanced brief
        enhanced_brief = await self._generate_final_brief(stakeholder_inputs, consolidated_research)
        
        # 4. Add metadata
        result = {
            "brief_content": enhanced_brief,
            "research_data": consolidated_research,
            "generation_metadata": {
                "timestamp": datetime.now().isoformat(),
                "research_time_seconds": research_time,
                "stakeholder_inputs": stakeholder_inputs,
                "agents_used": ["competitor", "trends", "audience", "brief_generator"]
            }
        }
        
        return result
    
    async def _generate_final_brief(self, stakeholder_inputs: Dict, research: Dict) -> str:
        """Generates the final brief combining original template + research"""
        
        # Create enriched prompt specific to your template
        enhanced_prompt = f"""
        {self.original_template}
        
        **TEAM INPUT DATA (JSON):**
        {json.dumps(stakeholder_inputs, indent=2)}
        
        **🤖 AI RESEARCH FINDINGS - Use them to enrich each section:**
        
        **COMPETITOR ANALYSIS:**
        - Main competitors: {[comp.get('name', 'N/A') for comp in research['competitor_analysis']['top_competitors'][:3]]}
        - Positioning gaps: {research['competitor_analysis']['market_positioning']['gap_opportunities']}
        - Pricing insights: {research['competitor_analysis']['pricing_insights']['recommendation']}
        - Messaging patterns: {research['competitor_analysis']['messaging_patterns']['common_themes']}
        - Missing angles: {research['competitor_analysis']['messaging_patterns']['missing_angles']}
        
        **MARKET TRENDS & DEMAND:**
        - Industry growth: {research['market_trends']['industry_trends'].get('growth_rate', 'N/A')}
        - Rising searches: {research['market_trends']['industry_trends'].get('rising_searches', [])}
        - Hot topics: {research['market_trends']['industry_trends'].get('hot_topics', [])}
        - Best launch timing: {research['market_trends']['seasonal_patterns']['best_launch_timing']}
        - Seasonal patterns: {research['market_trends']['seasonal_patterns']}
        
        **ENRICHED AUDIENCE INSIGHTS:**
        - Demographic profile: {research['audience_insights']['demographic_profile']}
        - Validated pain points: {research['audience_insights']['pain_points'][:5]}
        - Channel preferences: {research['audience_insights']['channel_preferences']}
        - Content preferences: {research['audience_insights']['content_consumption']}
        - Buying journey: {research['audience_insights']['buying_journey']}
        - Behavioral insights: {research['audience_insights']['behavioral_insights']}
        
        **SPECIFIC INSTRUCTIONS:**
        1. Replace [COMPANY_NAME] with the real company name
        2. Integrate the AI research findings into each relevant section of the brief
        3. Use competitor data to reinforce the "Why [COMPANY] (Platform)?" section
        4. Incorporate market trends into "Present market trend and demand"
        5. Use audience insights to enrich the "Target Audience" section
        6. For sections without explicit data, use research to infer relevant information
        7. Maintain a professional and B2B business-oriented tone
        8. Ensure each section has specific and actionable information
        9. Include quantitative data where possible (percentages, ranges, metrics)
        10. Connect audience pain points with solutions/offering
        
        **AI RESEARCH VALIDATIONS:**
        - If there are conflicts between stakeholder inputs and market research, mention both perspectives
        - Use competitor analysis to validate or question assumptions about positioning
        - Incorporate audience behavioral insights to refine targeting
        - Suggest optimizations based on channel preferences from audience research
        
        Generate a complete, professional, and data-driven brief following exactly the provided structure.
        """
        
        # Generate brief using Gemini
        response = self.client.generate_content(enhanced_prompt)
        brief_content = response.text

        # Count tokens for debugging
        try:
            token_count = self.client.count_tokens(enhanced_prompt)
            print(f"Token count: {token_count}")
        except Exception as e:
            print(f"Could not count tokens: {e}")
        
        return brief_content

# =============================================================================
# 3. DEMO INTERFACE - For Hackathon
# =============================================================================

class HackathonDemo:
    """Simplified interface for hackathon demo"""
    
    def __init__(self, gemini_api_key: str, serper_api_key: str = None):
        self.orchestrator = AgenticBriefOrchestrator(gemini_api_key, serper_api_key)
    
    async def run_demo(self):
        """Runs full demo for EdgeVerve AI Platform"""
        
        # Specific data for EdgeVerve AI Platform
        inputs = {
            "company_name": "EdgeVerve AI Next",
            "industry": "enterprise_ai",
            "company_type": "ai_platform",
            "business_objective": "Establish EdgeVerve as the leading provider of Applied AI solutions for enterprises",
            "target_audience": "CIOs and CIO-1 of companies with $1B-$5B USD revenue in financial, healthcare, and manufacturing sectors",
            "key_message": "Unified platform that scales Applied AI across the enterprise, connecting people, processes, data, and systems",
            "budget": "$2,000,000",
            "timeline": "12 months",
            "brand_personality": "Innovative, reliable, enterprise-grade",
            "preferred_channels": ["LinkedIn", "Google Ads", "YouTube", "Industry Publications"],
            "differentiators": [
                "PolyAI - model flexibility",
                "Cloud-agnostic deployment",
                "Built-in responsible AI",
                "AI democratization"
            ],
            "market_challenges": [
                "Scaling beyond AI experimentation",
                "Isolated systems and data",
                "Lack of enterprise data readiness",
                "Legacy manual processes"
            ]
        }
        
        print(f"🎯 Starting EdgeVerve AI Platform brief generation...")
        print(f"📊 Company: {inputs['company_name']}")
        print("=" * 50)
        
        # Generate agentic brief
        result = await self.orchestrator.generate_enhanced_brief(inputs)

        # Generate professional PDF
        pdf_path = generate_pdf_from_brief(
            brief_content=result["brief_content"],
            stakeholder_inputs=inputs,
            research_data=result["research_data"]
        )

        print(f"📄 PDF generated: {pdf_path}")

        # Show results
        self._display_results(result)
        
        return result
    
    def _display_results(self, result: Dict):
        """Displays results attractively for demo"""
        
        print("\n🎨 CREATIVE BRIEF GENERATED")
        print("=" * 50)
        print(result["brief_content"])
        
        print("\n\n🤖 AI RESEARCH SUMMARY")
        print("=" * 50)
        
        research = result["research_data"]
        
        print("📈 MARKET TRENDS:")
        trends = research["market_trends"]["industry_trends"]
        for trend in trends.get("rising_searches", [])[:3]:
            print(f"  • {trend}")
        
        print("\n🏢 COMPETITOR INSIGHTS:")
        competitors = research["competitor_analysis"]["top_competitors"][:3]
        for comp in competitors:
            print(f"  • {comp.get('name', 'Unknown')}: {comp.get('focus', 'N/A')}")
        
        print("\n👥 AUDIENCE INSIGHTS:")
        audience = research["audience_insights"]
        print(f"  • Demographics: {audience['demographic_profile']['age_range']}")
        print(f"  • Primary channels: {', '.join(audience['channel_preferences']['primary_channels'][:3])}")
        print(f"  • Key pain points: {', '.join(audience['pain_points'][:3])}")
        
        print("\n📊 GENERATION METADATA:")
        metadata = result["generation_metadata"]
        print(f"  • Research time: {metadata['research_time_seconds']:.2f} seconds")
        print(f"  • Agents used: {len(metadata['agents_used'])}")
        print(f"  • Generated at: {metadata['timestamp']}")

# =============================================================================
# 4. MAIN EXECUTION
# =============================================================================

async def main():
    """Main function to run EdgeVerve AI Platform demo"""
    
    # Configuration (replace with your APIs)
    GEMINI_API_KEY = "AIzaSyDXSjIm0Ylet1aDnPw-oUbqpTzniOeHSpQ"
    SERPER_API_KEY = "4c31090113c4a9798844f3eca1e494363e13f0f3"  # Optional for real searches
    
    # Create demo
    demo = HackathonDemo(GEMINI_API_KEY, SERPER_API_KEY)
    
    print("🚀 EdgeVerve AI Platform Brief Generator")
    print("=" * 50)
    print("Generating creative brief for AI Platform...")
    
    # Run demo directly with AI Platform
    await demo.run_demo()
    
    print("\n✅ EdgeVerve AI Platform Brief Generated Successfully!")
    print("  • Researched enterprise AI competitors automatically")
    print("  • Analyzed AI technology market trends in real-time") 
    print("  • Enriched CIO/technology leader audience data with insights")
    print("  • Generated comprehensive creative brief")
    print("  • All in under 30 seconds!")

if __name__ == "__main__":
    asyncio.run(main())
