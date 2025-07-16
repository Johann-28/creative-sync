import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, delay, map, catchError, throwError } from 'rxjs';

export interface BriefSection {
  id: number;
  icon: string;
  title: string;
  content: string;
  type: 'text' | 'insights' | 'metrics';
  insights?: InsightCard[];
  createdAt?: Date;
  updatedAt?: Date;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface InsightCard {
  title: string;
  content: string;
  confidence?: number;
  source?: string;
}

export interface BriefTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  sections: BriefSection[];
}

// Backend response interfaces
export interface BackendResponse {
  metadata: {
    agents_used: string[];
    research_time: number;
    total_sections: number;
  };
  sections: BackendSection[];
}

export interface BackendSection {
  content: string;
  icon: string;
  id: number;
  title: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class BriefService {
  private readonly API_BASE_URL = 'http://localhost:5000';
  private readonly GENERATE_BRIEF_ENDPOINT = `${this.API_BASE_URL}/generate-brief`;
  
  // Mock data - simula datos que vendrían del servidor
  private mockBriefSections: BriefSection[] = [
    {
      id: 0,
      icon: '🎯',
      title: 'Campaign Objective',
      content: 'Launch TechFlow CRM to small business owners in healthcare, driving 50,000 app downloads within 8 weeks while establishing the brand as the go-to solution for healthcare practice automation.',
      type: 'text',
      category: 'objectives',
      priority: 'high',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: 1,
      icon: '👥',
      title: 'Target Audience',
      content: `<strong>Primary:</strong> Healthcare practice owners and managers (ages 28-42)<br>
                <strong>Characteristics:</strong> Tech-savvy but time-constrained, focused on efficiency and patient care quality<br>
                <strong>Pain Points:</strong> Manual scheduling, patient data management, billing inefficiencies<br>
                <strong>Motivation:</strong> Streamline operations to focus more on patient care`,
      type: 'text',
      category: 'audience',
      priority: 'high',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-18')
    },
    {
      id: 2,
      icon: '💬',
      title: 'Key Message',
      content: '"TechFlow CRM gives healthcare professionals 5 hours back each week through intelligent automation, so you can focus on what matters most—your patients."',
      type: 'text',
      category: 'messaging',
      priority: 'high',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-19')
    },
    {
      id: 3,
      icon: '🎨',
      title: 'Tone and Brand Personality',
      content: `<strong>Primary Tone:</strong> Professional yet approachable, empowering<br>
                <strong>Voice Characteristics:</strong> Confident, supportive, solution-focused<br>
                <strong>Visual Style:</strong> Clean, minimalist design with healthcare-appropriate color palette (trustworthy blues, calming greens)`,
      type: 'text',
      category: 'branding',
      priority: 'medium',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-21')
    },
    {
      id: 4,
      icon: '📱',
      title: 'Suggested Channels/Media',
      content: `<strong>Primary Channels:</strong> LinkedIn sponsored content, Healthcare industry publications<br>
                <strong>Secondary:</strong> Email sequences, Webinar series, Demo videos<br>
                <strong>Content Formats:</strong> Video testimonials, Interactive demos, Case studies, Infographics`,
      type: 'text',
      category: 'channels',
      priority: 'medium',
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date('2024-01-22')
    },
    {
      id: 5,
      icon: '🧠',
      title: 'Key AI-Generated Insights',
      content: 'AI-powered insights based on market analysis and industry trends',
      type: 'insights',
      category: 'insights',
      priority: 'high',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-23'),
      insights: [
        {
          title: 'Optimal Timing',
          content: 'Launch campaign on Tuesday-Thursday, 9-11 AM when healthcare professionals check professional content',
          confidence: 0.92,
          source: 'Industry Analytics'
        },
        {
          title: 'Content Performance',
          content: 'Video testimonials from actual healthcare workers generate 3.2x more engagement than generic demos',
          confidence: 0.87,
          source: 'Content Analysis'
        },
        {
          title: 'Competitive Advantage',
          content: 'Emphasize HIPAA compliance and healthcare-specific features—67% of competitors don\'t highlight this',
          confidence: 0.94,
          source: 'Competitive Intelligence'
        },
        {
          title: 'Budget Allocation',
          content: 'Recommended: 40% LinkedIn ads, 30% content creation, 20% email marketing, 10% retargeting',
          confidence: 0.89,
          source: 'Performance Data'
        }
      ]
    },
    {
      id: 6,
      icon: '📊',
      title: 'Success Metrics',
      content: `<strong>Primary KPIs:</strong><br>
                • 50,000 app downloads within 8 weeks<br>
                • 15% trial-to-paid conversion rate<br>
                • Cost per acquisition under $25<br><br>
                <strong>Secondary KPIs:</strong><br>
                • 25% increase in brand awareness in healthcare sector<br>
                • 500+ webinar registrations<br>
                • 3.5+ average content engagement rate`,
      type: 'metrics',
      category: 'kpis',
      priority: 'high',
      createdAt: new Date('2024-01-19'),
      updatedAt: new Date('2024-01-24')
    },
    {
      id: 7,
      icon: '🤝',
      title: 'Stakeholder Contributions',
      content: `<strong>Marketing Team:</strong> Campaign objectives, target metrics, channel strategy<br>
                <strong>Product Team:</strong> Key features, technical differentiators, user benefits<br>
                <strong>Design Team:</strong> Visual direction, brand consistency, content formats<br>
                <strong>Sales Team:</strong> Customer pain points, objection handling, pricing strategy`,
      type: 'text',
      category: 'stakeholders',
      priority: 'medium',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-25')
    }
  ];

  private mockTemplates: BriefTemplate[] = [
    {
      id: 'healthcare-tech',
      name: 'Healthcare Technology Launch',
      description: 'Template optimized for healthcare technology product launches',
      industry: 'Healthcare Technology',
      sections: this.mockBriefSections
    },
    {
      id: 'b2b-saas',
      name: 'B2B SaaS Product Launch',
      description: 'Template for B2B SaaS solution launches',
      industry: 'Software Technology',
      sections: this.mockBriefSections.slice(0, 6) // Different sections for different templates
    }
  ];

  constructor(private http: HttpClient) {}

  // Obtener todas las secciones del brief desde el backend
  getBriefSections(): Observable<BriefSection[]> {
    return this.http.post<BackendResponse>(this.GENERATE_BRIEF_ENDPOINT , {}).pipe(
      map(response => this.transformBackendResponse(response)),
      catchError(this.handleError.bind(this))
    );
  }

  // Método de fallback para usar datos mock si el backend no está disponible
  getBriefSectionsMock(): Observable<BriefSection[]> {
    return of(this.mockBriefSections).pipe(
      delay(800) // Simula latencia de red
    );
  }

  // Transformar respuesta del backend al formato interno
  private transformBackendResponse(response: BackendResponse): BriefSection[] {
    return response.sections.map(section => ({
      id: section.id,
      icon: section.icon,
      title: section.title,
      content: section.content,
      type: this.mapBackendType(section.type),
      category: this.inferCategory(section.title),
      priority: this.inferPriority(section.title),
      createdAt: new Date(),
      updatedAt: new Date(),
      insights: section.type === 'insights' ? this.generateDefaultInsights() : undefined
    }));
  }

  // Mapear tipos del backend a tipos internos
  private mapBackendType(backendType: string): 'text' | 'insights' | 'metrics' {
    switch (backendType.toLowerCase()) {
      case 'insights':
        return 'insights';
      case 'metrics':
      case 'kpis':
        return 'metrics';
      default:
        return 'text';
    }
  }

  // Inferir categoría basada en el título
  private inferCategory(title: string): string {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('objective') || titleLower.includes('goal')) return 'objectives';
    if (titleLower.includes('audience') || titleLower.includes('target')) return 'audience';
    if (titleLower.includes('message') || titleLower.includes('messaging')) return 'messaging';
    if (titleLower.includes('brand') || titleLower.includes('tone')) return 'branding';
    if (titleLower.includes('channel') || titleLower.includes('media')) return 'channels';
    if (titleLower.includes('insight') || titleLower.includes('ai')) return 'insights';
    if (titleLower.includes('metric') || titleLower.includes('kpi')) return 'kpis';
    if (titleLower.includes('stakeholder') || titleLower.includes('team')) return 'stakeholders';
    
    return 'general';
  }

  // Inferir prioridad basada en el título y contenido
  private inferPriority(title: string): 'high' | 'medium' | 'low' {
    const titleLower = title.toLowerCase();
    
    // Alta prioridad para objetivos, audiencia, mensajes clave
    if (titleLower.includes('objective') || titleLower.includes('audience') || 
        titleLower.includes('message') || titleLower.includes('goal')) {
      return 'high';
    }
    
    // Prioridad media para canales, insights, métricas
    if (titleLower.includes('channel') || titleLower.includes('insight') || 
        titleLower.includes('metric') || titleLower.includes('brand')) {
      return 'medium';
    }
    
    // Prioridad baja para el resto
    return 'low';
  }

  // Generar insights por defecto para secciones de insights
  private generateDefaultInsights(): InsightCard[] {
    return [
      {
        title: 'AI-Generated Insight',
        content: 'This section contains AI-generated insights based on market analysis.',
        confidence: 0.85,
        source: 'Backend AI Analysis'
      }
    ];
  }

  // Manejo de errores HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido al obtener las secciones del brief';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error de conexión: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar al servidor. Verifique que el backend esté ejecutándose en http://localhost:5000';
          break;
        case 404:
          errorMessage = 'Endpoint no encontrado. Verifique la URL del backend.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Revise los logs del backend.';
          break;
        default:
          errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
      }
    }
    
    console.error('Error completo:', error);
    return throwError(() => new Error(errorMessage));
  }

  // Obtener sección específica por ID
  getBriefSectionById(id: number): Observable<BriefSection | null> {
    const section = this.mockBriefSections.find(s => s.id === id);
    return of(section || null).pipe(
      delay(300)
    );
  }

  // Obtener secciones por categoría
  getBriefSectionsByCategory(category: string): Observable<BriefSection[]> {
    const sections = this.mockBriefSections.filter(s => s.category === category);
    return of(sections).pipe(
      delay(400)
    );
  }

  // Obtener secciones por prioridad
  getBriefSectionsByPriority(priority: 'high' | 'medium' | 'low'): Observable<BriefSection[]> {
    const sections = this.mockBriefSections.filter(s => s.priority === priority);
    return of(sections).pipe(
      delay(350)
    );
  }

  // Crear nueva sección
  createBriefSection(section: Omit<BriefSection, 'id' | 'createdAt' | 'updatedAt'>): Observable<BriefSection> {
    const newSection: BriefSection = {
      ...section,
      id: Math.max(...this.mockBriefSections.map(s => s.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockBriefSections.push(newSection);
    
    return of(newSection).pipe(
      delay(600)
    );
  }

  // Actualizar sección existente
  updateBriefSection(id: number, updates: Partial<BriefSection>): Observable<BriefSection | null> {
    const sectionIndex = this.mockBriefSections.findIndex(s => s.id === id);
    
    if (sectionIndex === -1) {
      return of(null).pipe(delay(300));
    }

    this.mockBriefSections[sectionIndex] = {
      ...this.mockBriefSections[sectionIndex],
      ...updates,
      updatedAt: new Date()
    };

    return of(this.mockBriefSections[sectionIndex]).pipe(
      delay(500)
    );
  }

  // Eliminar sección
  deleteBriefSection(id: number): Observable<boolean> {
    const initialLength = this.mockBriefSections.length;
    this.mockBriefSections = this.mockBriefSections.filter(s => s.id !== id);
    
    return of(this.mockBriefSections.length < initialLength).pipe(
      delay(400)
    );
  }

  // Obtener plantillas disponibles
  getBriefTemplates(): Observable<BriefTemplate[]> {
    return of(this.mockTemplates).pipe(
      delay(600)
    );
  }

  // Obtener plantilla por ID
  getBriefTemplateById(id: string): Observable<BriefTemplate | null> {
    const template = this.mockTemplates.find(t => t.id === id);
    return of(template || null).pipe(
      delay(400)
    );
  }

  // Generar insights con IA (simulado)
  generateAIInsights(briefData: any): Observable<InsightCard[]> {
    const insights: InsightCard[] = [
      {
        title: 'Audience Optimization',
        content: `Based on your target audience (${briefData.primaryAudience || 'healthcare professionals'}), recommend focusing on professional networks and industry publications`,
        confidence: 0.91,
        source: 'Audience Analysis AI'
      },
      {
        title: 'Message Resonance',
        content: `Your key message has 87% alignment with successful campaigns in the ${briefData.industry || 'healthcare'} sector`,
        confidence: 0.87,
        source: 'Message Analysis AI'
      },
      {
        title: 'Channel Performance Prediction',
        content: `Based on similar campaigns, expect 23% higher performance on LinkedIn compared to other social platforms`,
        confidence: 0.84,
        source: 'Channel Prediction AI'
      },
      {
        title: 'Budget Efficiency',
        content: `Current budget allocation shows potential for 15% cost reduction while maintaining reach goals`,
        confidence: 0.78,
        source: 'Budget Optimization AI'
      }
    ];

    return of(insights).pipe(
      delay(1200) // Simula procesamiento de IA más lento
    );
  }

  // Buscar secciones por texto
  searchBriefSections(query: string): Observable<BriefSection[]> {
    const results = this.mockBriefSections.filter(section => 
      section.title.toLowerCase().includes(query.toLowerCase()) ||
      section.content.toLowerCase().includes(query.toLowerCase()) ||
      (section.insights && section.insights.some(insight => 
        insight.title.toLowerCase().includes(query.toLowerCase()) ||
        insight.content.toLowerCase().includes(query.toLowerCase())
      ))
    );

    return of(results).pipe(
      delay(300)
    );
  }

  // Exportar brief completo
  exportBrief(format: 'pdf' | 'json' | 'docx'): Observable<{ url: string; filename: string }> {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `creative-brief-${timestamp}.${format}`;
    
    // Simular URL de descarga
    const mockUrl = `https://api.creativesync.com/exports/${filename}`;
    
    return of({ url: mockUrl, filename }).pipe(
      delay(2000) // Simula tiempo de generación del archivo
    );
  }

  // Sincronizar con stakeholders (simulado)
  syncWithStakeholders(): Observable<{ success: boolean; lastSync: Date }> {
    return of({ 
      success: true, 
      lastSync: new Date() 
    }).pipe(
      delay(1500)
    );
  }

  // Generar brief con parámetros personalizados
  generateBrief(params?: any): Observable<BriefSection[]> {
    const requestBody = params || {
      industry: 'technology',
      company_name: 'TechFlow',
      product_type: 'CRM',
      target_audience: 'healthcare professionals'
    };

    return this.http.post<BackendResponse>(this.GENERATE_BRIEF_ENDPOINT, requestBody).pipe(
      map(response => this.transformBackendResponse(response)),
      catchError(this.handleError.bind(this))
    );
  }

  // Obtener metadatos de la última generación
  getLastGenerationMetadata(): Observable<any> {
    return this.http.get<BackendResponse>(this.GENERATE_BRIEF_ENDPOINT).pipe(
      map(response => response.metadata),
      catchError(() => of(null))
    );
  }
}
