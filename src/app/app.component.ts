import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BriefSection {
  id: number;
  icon: string;
  title: string;
  content: string;
  type: 'text' | 'insights' | 'metrics';
  insights?: InsightCard[];
}

interface InsightCard {
  title: string;
  content: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AppComponent implements OnInit {
  title = 'creative-sync';

  
// Sections
briefSections: BriefSection[] = [
{
    id: 0,
    icon: '🎯',
    title: 'Campaign Objective',
    content: 'Launch TechFlow CRM to small business owners in healthcare, driving 50,000 app downloads within 8 weeks while establishing the brand as the go-to solution for healthcare practice automation.',
    type: 'text'
},
{
    id: 1,
    icon: '👥',
    title: 'Target Audience',
    content: `<strong>Primary:</strong> Healthcare practice owners and managers (ages 28-42)<br>
            <strong>Characteristics:</strong> Tech-savvy but time-constrained, focused on efficiency and patient care quality<br>
            <strong>Pain Points:</strong> Manual scheduling, patient data management, billing inefficiencies<br>
            <strong>Motivation:</strong> Streamline operations to focus more on patient care`,
    type: 'text'
},
{
    id: 2,
    icon: '💬',
    title: 'Key Message',
    content: '"TechFlow CRM gives healthcare professionals 5 hours back each week through intelligent automation, so you can focus on what matters most—your patients."',
    type: 'text'
},
{
    id: 3,
    icon: '🎨',
    title: 'Tone and Brand Personality',
    content: `<strong>Primary Tone:</strong> Professional yet approachable, empowering<br>
            <strong>Voice Characteristics:</strong> Confident, supportive, solution-focused<br>
            <strong>Visual Style:</strong> Clean, minimalist design with healthcare-appropriate color palette (trustworthy blues, calming greens)`,
    type: 'text'
},
{
    id: 4,
    icon: '📱',
    title: 'Suggested Channels/Media',
    content: `<strong>Primary Channels:</strong> LinkedIn sponsored content, Healthcare industry publications<br>
            <strong>Secondary:</strong> Email sequences, Webinar series, Demo videos<br>
            <strong>Content Formats:</strong> Video testimonials, Interactive demos, Case studies, Infographics`,
    type: 'text'
},
{
    id: 5,
    icon: '🧠',
    title: 'Key AI-Generated Insights',
    content: 'AI-powered insights based on market analysis and industry trends',
    type: 'insights',
    insights: [
    {
        title: 'Optimal Timing',
        content: 'Launch campaign on Tuesday-Thursday, 9-11 AM when healthcare professionals check professional content'
    },
    {
        title: 'Content Performance',
        content: 'Video testimonials from actual healthcare workers generate 3.2x more engagement than generic demos'
    },
    {
        title: 'Competitive Advantage',
        content: 'Emphasize HIPAA compliance and healthcare-specific features—67% of competitors don\'t highlight this'
    },
    {
        title: 'Budget Allocation',
        content: 'Recommended: 40% LinkedIn ads, 30% content creation, 20% email marketing, 10% retargeting'
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
    type: 'text'
},
{
    id: 7,
    icon: '🤝',
    title: 'Stakeholder Contributions',
    content: `<strong>Marketing Team:</strong> Campaign objectives, target metrics, channel strategy<br>
            <strong>Product Team:</strong> Key features, technical differentiators, user benefits<br>
            <strong>Design Team:</strong> Visual direction, brand consistency, content formats<br>
            <strong>Sales Team:</strong> Customer pain points, objection handling, pricing strategy`,
    type: 'text'
}
];
  

  // ...existing properties...
  currentZoom = 1;
  currentPanX = 0;
  currentPanY = 0;
  minZoom = 0.5;
  maxZoom = 3;
  zoomStep = 0.25;
  isDragging = false;
  lastMouseX = 0;
  lastMouseY = 0;
  selectedSection: HTMLElement | null = null;

  // Angular reactive properties
  chatModalActive = false;
  currentScreen = 1;
  activeTab = 0;
  suggestedQuestions: string[] = [];
  chatMessages: Array<{sender: 'user' | 'ai', text: string, time: string}> = [];
  selectionMode = false;
  selectedSectionIndex: number | null = null;
  chatInputText = '';

  // Creative Brief Wizard properties
  currentStep: number = 1;
  totalSteps: number = 8;
  briefData: any = {
    // Step 1: Business & Brand Info
    companyName: '',
    industry: '',
    brandPersonality: [],
    keyDifferentiators: '',
    brandGuidelines: '',
    stakeholders: [],

    // Step 2: Target Audience
    primaryAudience: '',
    secondaryAudience: '',
    currentPerception: '',
    culturalConsiderations: '',

    // Step 3: Campaign Objective
    campaignObjective: '',
    smartGoals: '',
    businessProblem: '',

    // Step 4: Messages & CTA
    primaryMessage: '',
    secondaryMessages: '',
    callToAction: '',
    strategyAlignment: '',

    // Step 5: Channels & Formats
    contentTypes: [],
    channels: [],
    channelPerformance: '',
    geographicReach: '',

    // Step 6: Timeline
    startDate: '',
    endDate: '',
    keyDates: '',
    internalDeadlines: '',

    // Step 7: Measurement & KPIs
    successMetrics: '',
    kpis: [],
    reportingRequirements: '',
    estimatedROI: '',

    // Step 8: Budget & Final Considerations
    budget: '',
    budgetBreakdown: '',
    legalRequirements: '',
    additionalNotes: ''
  };

  // AI Suggestions
  industryOptions = [
    'Technology', 'Healthcare', 'Finance', 'Retail', 'Education', 'Manufacturing',
    'Real Estate', 'Food & Beverage', 'Travel & Tourism', 'Automotive', 'Entertainment'
  ];

  brandPersonalityOptions = [
    { value: 'professional', label: 'Profesional', aiRecommended: false },
    { value: 'friendly', label: 'Amigable', aiRecommended: true },
    { value: 'innovative', label: 'Innovadora', aiRecommended: true },
    { value: 'conservative', label: 'Conservadora', aiRecommended: false },
    { value: 'youthful', label: 'Juvenil', aiRecommended: false },
    { value: 'sophisticated', label: 'Sofisticada', aiRecommended: false },
    { value: 'trustworthy', label: 'Confiable', aiRecommended: true },
    { value: 'dynamic', label: 'Dinámico', aiRecommended: false }
  ];

  campaignObjectiveOptions = [
    { value: 'product-launch', label: 'Lanzamiento de producto', aiRecommended: true },
    { value: 'lead-generation', label: 'Generación de leads', aiRecommended: false },
    { value: 'brand-awareness', label: 'Awareness de marca', aiRecommended: false },
    { value: 'customer-retention', label: 'Retención de clientes', aiRecommended: false },
    { value: 'market-expansion', label: 'Expansión de mercado', aiRecommended: true }
  ];

  contentTypeOptions = [
    { value: 'social-posts', label: 'Posts de redes sociales', aiRecommended: true },
    { value: 'email-campaign', label: 'Campaña de email', aiRecommended: true },
    { value: 'website', label: 'Sitio web', aiRecommended: false },
    { value: 'video', label: 'Video', aiRecommended: true },
    { value: 'presentation', label: 'Presentación', aiRecommended: false },
    { value: 'article', label: 'Artículo', aiRecommended: false },
    { value: 'infographic', label: 'Infografía', aiRecommended: false }
  ];

  channelOptions = [
    { value: 'social-media', label: 'Redes sociales', aiRecommended: true },
    { value: 'paid-ads', label: 'Anuncios pagados', aiRecommended: true },
    { value: 'email', label: 'Email marketing', aiRecommended: true },
    { value: 'website', label: 'Sitio web', aiRecommended: false },
    { value: 'events', label: 'Eventos', aiRecommended: false },
    { value: 'print-media', label: 'Medios impresos', aiRecommended: false },
    { value: 'influencer', label: 'Marketing de influencers', aiRecommended: false }
  ];

  kpiOptions = [
    { value: 'reach', label: 'Alcance', aiRecommended: true },
    { value: 'engagement', label: 'Engagement', aiRecommended: true },
    { value: 'conversions', label: 'Conversiones', aiRecommended: true },
    { value: 'brand-awareness', label: 'Brand Awareness', aiRecommended: false },
    { value: 'website-traffic', label: 'Tráfico web', aiRecommended: false },
    { value: 'lead-quality', label: 'Calidad de leads', aiRecommended: true }
  ];

  

  generatedBrief = '';
  isPreviewMode = false;

  ngOnInit(): void {
    // Initialize Angular state
    this.currentScreen = 1;
    this.activeTab = 0;
    this.chatModalActive = false;
    this.initSuggestedQuestions();

    // Add event listeners for network nodes
    document.querySelectorAll('.network-node').forEach(node => {
      node.addEventListener('mouseleave', () => this.hideTooltip());
    });

    // Initialize network visualization
    this.initializeNetwork();

    // Hide pan hint after 5 seconds
    setTimeout(() => {
      const panHint = document.getElementById('panHint');
      if (panHint) {
        panHint.classList.add('hidden');
      }
    }, 5000);

    // Add some interactive enhancements
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', function (this: HTMLElement) {
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
          this.style.transform = '';
        }, 150);
      });
    });
  }

  showScreen(screenNumber: number): void {
    console.log(`Switching to screen ${screenNumber}`);
    this.currentScreen = screenNumber;
    this.activeTab = screenNumber - 1;
    console.log(`Current screen before switch: ${this.activeTab}`);
    
    // Still need DOM manipulation for existing screens until they're converted
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    const screenEl = document.getElementById(`screen-${screenNumber}`);
    if (screenEl) {
      screenEl.classList.add('active');
    }

    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    const navTabs = document.querySelectorAll('.nav-tab');
    if (navTabs[screenNumber - 1]) {
      navTabs[screenNumber - 1].classList.add('active');
    }
  }

  createProject(): void {
    alert('🎨 Creating new collaborative project...\n\nIn a real implementation, this would open a project setup wizard where you can:\n• Define project scope\n• Select stakeholder teams\n• Set deadlines\n• Configure AI parameters');
  }

  highlightConnections(lineIds: string[]): void {
    this.clearHighlights();

    lineIds.forEach(lineId => {
      const line = document.getElementById(lineId);
      if (line) {
        line.classList.add('highlighted');
      }
    });

    document.querySelectorAll('.network-node').forEach(node => {
      if (
        lineIds.some(id => id.includes('mkt')) && node.classList.contains('marketing')
      ) {
        node.classList.add('highlighted');
      }
      if (
        lineIds.some(id => id.includes('prd')) && node.classList.contains('product')
      ) {
        node.classList.add('highlighted');
      }
      if (
        lineIds.some(id => id.includes('des')) && node.classList.contains('design')
      ) {
        node.classList.add('highlighted');
      }
      if (
        lineIds.some(id => id.includes('sal')) && node.classList.contains('sales')
      ) {
        node.classList.add('highlighted');
      }
    });
  }

  clearHighlights(): void {
    document.querySelectorAll('.connection-line').forEach(line => {
      line.classList.remove('highlighted');
    });

    document.querySelectorAll('.network-node').forEach(node => {
      node.classList.remove('highlighted');
    });
  }

  showTooltip(event: MouseEvent, title: string, content: string): void {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
      tooltip.innerHTML = `<strong>${title}</strong><br>${content}`;
      tooltip.style.display = 'block';
      tooltip.style.left = (event.pageX + 10) + 'px';
      tooltip.style.top = (event.pageY - 10) + 'px';
    }
  }

  hideTooltip(): void {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  initializeNetwork(): void {
    document.querySelectorAll('.connection-line').forEach(line => {
      if (line instanceof HTMLElement) {
        line.style.display = 'block';
      }
    });

    document.querySelectorAll('.network-node').forEach(node => {
      node.addEventListener('mouseenter', function (this: HTMLElement) {
        this.style.zIndex = '15';
      });
      node.addEventListener('mouseleave', function (this: HTMLElement) {
        this.style.zIndex = '5';
      });
    });

    this.initializeNetworkZoom();
  }

  zoomIn(): void {
    if (this.currentZoom < this.maxZoom) {
      this.currentZoom += this.zoomStep;
      this.applyTransform();
    }
  }

  zoomOut(): void {
    if (this.currentZoom > this.minZoom) {
      this.currentZoom -= this.zoomStep;
      this.applyTransform();
    }
  }

  resetZoom(): void {
    this.currentZoom = 1;
    this.currentPanX = 0;
    this.currentPanY = 0;
    this.applyTransform();

    const panHint = document.getElementById('panHint');
    if (panHint) {
      panHint.classList.remove('hidden');
      setTimeout(() => {
        panHint.classList.add('hidden');
      }, 3000);
    }
  }

  applyTransform(): void {
    const canvas = document.getElementById('networkCanvas') as HTMLElement | null;
    if (canvas) {
      canvas.style.transform = `translate(${this.currentPanX}px, ${this.currentPanY}px) scale(${this.currentZoom})`;

      const zoomInBtn = document.querySelector('.zoom-controls .zoom-btn:first-child') as HTMLElement | null;
      const zoomOutBtn = document.querySelector('.zoom-controls .zoom-btn:nth-child(2)') as HTMLElement | null;

      if (zoomInBtn) {
        zoomInBtn.style.opacity = this.currentZoom >= this.maxZoom ? '0.5' : '1';
        zoomInBtn.style.pointerEvents = this.currentZoom >= this.maxZoom ? 'none' : 'auto';
      }

      if (zoomOutBtn) {
        zoomOutBtn.style.opacity = this.currentZoom <= this.minZoom ? '0.5' : '1';
        zoomOutBtn.style.pointerEvents = this.currentZoom <= this.minZoom ? 'none' : 'auto';
      }
    }
  }

  initializeNetworkZoom(): void {
    const container = document.querySelector('.network-container');
    const canvas = document.getElementById('networkCanvas') as HTMLElement | null;

    if (container && canvas) {
      // Mouse wheel zoom
      container.addEventListener('wheel', (e: Event) => {
        const wheelEvent = e as WheelEvent;
        wheelEvent.preventDefault();

        if (wheelEvent.deltaY < 0) {
          this.zoomIn();
        } else {
          this.zoomOut();
        }
      });

      // Mouse drag to pan
      canvas.addEventListener('mousedown', (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          !target.classList.contains('network-node') &&
          !target.closest('.network-node')
        ) {
          this.isDragging = true;
          this.lastMouseX = e.clientX;
          this.lastMouseY = e.clientY;
          canvas.classList.add('dragging');
          e.preventDefault();
        }
      });

      document.addEventListener('mousemove', (e: MouseEvent) => {
        if (this.isDragging) {
          const deltaX = e.clientX - this.lastMouseX;
          const deltaY = e.clientY - this.lastMouseY;

          this.currentPanX += deltaX;
          this.currentPanY += deltaY;

          this.applyTransform();

          this.lastMouseX = e.clientX;
          this.lastMouseY = e.clientY;
        }
      });

      document.addEventListener('mouseup', () => {
        if (this.isDragging) {
          this.isDragging = false;
          canvas.classList.remove('dragging');
        }
      });

      // Touch support for mobile
      let initialTouchDistance = 0;
      let initialZoom = 1;

      canvas.addEventListener('touchstart', (e: TouchEvent) => {
        if (e.touches.length === 2) {
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          initialTouchDistance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
          );
          initialZoom = this.currentZoom;
          e.preventDefault();
        } else if (e.touches.length === 1) {
          this.isDragging = true;
          this.lastMouseX = e.touches[0].clientX;
          this.lastMouseY = e.touches[0].clientY;
          canvas.classList.add('dragging');
          e.preventDefault();
        }
      });

      canvas.addEventListener('touchmove', (e: TouchEvent) => {
        if (e.touches.length === 2) {
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const currentDistance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
          );

          const scale = currentDistance / initialTouchDistance;
          const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, initialZoom * scale));

          if (newZoom !== this.currentZoom) {
            this.currentZoom = newZoom;
            this.applyTransform();
          }
          e.preventDefault();
        } else if (e.touches.length === 1 && this.isDragging) {
          const deltaX = e.touches[0].clientX - this.lastMouseX;
          const deltaY = e.touches[0].clientY - this.lastMouseY;

          this.currentPanX += deltaX;
          this.currentPanY += deltaY;

          this.applyTransform();

          this.lastMouseX = e.touches[0].clientX;
          this.lastMouseY = e.touches[0].clientY;
          e.preventDefault();
        }
      });

      canvas.addEventListener('touchend', (e: TouchEvent) => {
        if (e.touches.length === 0) {
          this.isDragging = false;
          canvas.classList.remove('dragging');
        }
      });
    }
  }

  drawNetworkConnections(): void {
    // This would draw SVG lines between connected nodes
    // For demo purposes, we're keeping it simple with positioned nodes
  }

  simulateFormProgress(): void {
    const steps = document.querySelectorAll('.form-step');
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        steps[currentStep].classList.add('completed');
        steps[currentStep].classList.remove('active');
        currentStep++;

        if (currentStep < steps.length) {
          steps[currentStep].classList.add('active');
        }
      } else {
        clearInterval(interval);
      }
    }, 2000);
  }

  // Wizard Navigation Methods
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    } else {
      this.showScreen(3);
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }

  // AI Recommendation Methods
  getAIRecommendation(field: string): string {
    const recommendations: {[key: string]: string} = {
      'industry-tech': 'Basado en tendencias actuales, la industria tech muestra 67% más engagement con contenido visual',
      'personality-friendly': 'Las marcas amigables generan 34% más confianza en audiencias B2B',
      'objective-launch': 'Los lanzamientos de producto tienen mayor éxito con estrategias multi-canal',
      'content-video': 'El contenido de video genera 3.2x más engagement que contenido estático',
      'channel-social': 'Las redes sociales son ideales para alcance y engagement inicial'
    };
    return recommendations[field] || 'Recomendación basada en análisis de datos y tendencias del mercado';
  }

  // Form Validation
  isStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!(this.briefData.industry && this.briefData.brandPersonality.length > 0);
      case 2:
        return !!(this.briefData.primaryAudience);
      case 3:
        return !!(this.briefData.campaignObjective && this.briefData.smartGoals);
      case 4:
        return !!(this.briefData.primaryMessage && this.briefData.callToAction);
      case 5:
        return !!(this.briefData.contentTypes.length > 0 && this.briefData.channels.length > 0);
      case 6:
        return !!(this.briefData.startDate && this.briefData.endDate);
      case 7:
        return !!(this.briefData.successMetrics && this.briefData.kpis.length > 0);
      case 8:
        return !!(this.briefData.budget);
      default:
        return false;
    }
  }

  // Multi-select handlers
  toggleSelection(array: string[], value: string): void {
    const index = array.indexOf(value);
    if (index > -1) {
      array.splice(index, 1);
    } else {
      array.push(value);
    }
  }

  isSelected(array: string[], value: string): boolean {
    return array.includes(value);
  }

  // Generate Brief
  generateBrief(): void {
    this.isPreviewMode = true;
    this.generatedBrief = this.createBriefContent();
  }

  createBriefContent(): string {
    return `
      <div class="generated-brief">
        <h1>Creative Brief</h1>
        <h2>${this.briefData.companyName}</h2>
        
        <section>
          <h3>🏢 Información de la Empresa</h3>
          <p><strong>Industria:</strong> ${this.briefData.industry}</p>
          <p><strong>Personalidad de Marca:</strong> ${this.briefData.brandPersonality.join(', ')}</p>
          <p><strong>Diferenciadores:</strong> ${this.briefData.keyDifferentiators}</p>
        </section>

        <section>
          <h3>👥 Audiencia Objetivo</h3>
          <p><strong>Audiencia Primaria:</strong> ${this.briefData.primaryAudience}</p>
          ${this.briefData.secondaryAudience ? `<p><strong>Audiencia Secundaria:</strong> ${this.briefData.secondaryAudience}</p>` : ''}
          ${this.briefData.culturalConsiderations ? `<p><strong>Consideraciones Culturales:</strong> ${this.briefData.culturalConsiderations}</p>` : ''}
        </section>

        <section>
          <h3>🎯 Objetivos de la Campaña</h3>
          <p><strong>Objetivo Principal:</strong> ${this.briefData.campaignObjective}</p>
          <p><strong>Objetivos SMART:</strong> ${this.briefData.smartGoals}</p>
          <p><strong>Problema/Oportunidad:</strong> ${this.briefData.businessProblem}</p>
        </section>

        <section>
          <h3>💬 Mensajes y CTA</h3>
          <p><strong>Mensaje Principal:</strong> ${this.briefData.primaryMessage}</p>
          ${this.briefData.secondaryMessages ? `<p><strong>Mensajes Secundarios:</strong> ${this.briefData.secondaryMessages}</p>` : ''}
          <p><strong>Call to Action:</strong> ${this.briefData.callToAction}</p>
        </section>

        <section>
          <h3>📱 Canales y Formatos</h3>
          <p><strong>Tipos de Contenido:</strong> ${this.briefData.contentTypes.join(', ')}</p>
          <p><strong>Canales:</strong> ${this.briefData.channels.join(', ')}</p>
          <p><strong>Alcance Geográfico:</strong> ${this.briefData.geographicReach}</p>
        </section>

        <section>
          <h3>📅 Timeline</h3>
          <p><strong>Inicio:</strong> ${this.briefData.startDate}</p>
          <p><strong>Fin:</strong> ${this.briefData.endDate}</p>
          ${this.briefData.keyDates ? `<p><strong>Fechas Clave:</strong> ${this.briefData.keyDates}</p>` : ''}
        </section>

        <section>
          <h3>📊 KPIs y Medición</h3>
          <p><strong>Métricas de Éxito:</strong> ${this.briefData.successMetrics}</p>
          <p><strong>KPIs:</strong> ${this.briefData.kpis.join(', ')}</p>
          ${this.briefData.estimatedROI ? `<p><strong>ROI Estimado:</strong> ${this.briefData.estimatedROI}</p>` : ''}
        </section>

        <section>
          <h3>💰 Presupuesto</h3>
          <p><strong>Presupuesto Total:</strong> ${this.briefData.budget}</p>
          ${this.briefData.budgetBreakdown ? `<p><strong>Desglose:</strong> ${this.briefData.budgetBreakdown}</p>` : ''}
        </section>
      </div>
    `;
  }

  // Export Methods
  exportToPDF(): void {
    alert('📄 Exportando a PDF...\n\nEn una implementación real, esto generaría un PDF profesional del Creative Brief.');
  }

  exportToPresentation(): void {
    alert('📊 Exportando a Presentación...\n\nEn una implementación real, esto crearía una presentación ejecutiva.');
  }

  exportToText(): void {
    alert('📋 Exportando a Texto...\n\nEn una implementación real, esto generaría un documento de texto estructurado.');
  }

  // Reset wizard
  resetWizard(): void {
    this.currentStep = 1;
    this.isPreviewMode = false;
    this.briefData = {
      companyName: '', industry: '', brandPersonality: [], keyDifferentiators: '',
      brandGuidelines: '', stakeholders: [], primaryAudience: '', secondaryAudience: '',
      currentPerception: '', culturalConsiderations: '', campaignObjective: '',
      smartGoals: '', businessProblem: '', primaryMessage: '', secondaryMessages: '',
      callToAction: '', strategyAlignment: '', contentTypes: [], channels: [],
      channelPerformance: '', geographicReach: '', startDate: '', endDate: '',
      keyDates: '', internalDeadlines: '', successMetrics: '', kpis: [],
      reportingRequirements: '', estimatedROI: '', budget: '', budgetBreakdown: '',
      legalRequirements: '', additionalNotes: ''
    };
  }

  // Switch to wizard mode
  startWizard(): void {
    this.currentScreen = 2; // AI Wizard screen
    this.activeTab = 1; // Update active tab
    this.resetWizard();
  }

  // Missing methods for existing functionality
  initSuggestedQuestions(contextTitle: string | null = null): void {
    if (contextTitle) {
      this.suggestedQuestions = this.getContextualQuestions(contextTitle);
    } else {
      this.suggestedQuestions = [
        "Why did you recommend LinkedIn as the primary channel?",
        "How did you determine the optimal timing?",
        "What makes this campaign different from competitors?",
        "Can you explain the budget allocation strategy?",
        "How was the target audience defined?",
        "What are the expected ROI projections?"
      ];
    }
  }


  // Network node hover methods (simplified)
  onTargetAudienceHover(event: MouseEvent): void {
    this.showTooltip(event, 'Target Audience', 'AI synthesized audience insights');
  }

  onToneOfVoiceHover(event: MouseEvent): void {
    this.showTooltip(event, 'Tone of Voice', 'AI recommendation for brand voice');
  }

  onChannelsHover(event: MouseEvent): void {
    this.showTooltip(event, 'Suggested Channels', 'AI analysis of optimal channels');
  }

  onMarketingTeamHover(event: MouseEvent): void {
    this.showTooltip(event, 'Marketing Team', 'Marketing team input');
  }

  onProductTeamHover(event: MouseEvent): void {
    this.showTooltip(event, 'Product Team', 'Product team insights');
  }

  onDesignTeamHover(event: MouseEvent): void {
    this.showTooltip(event, 'Design Team', 'Design team preferences');
  }

  onSalesTeamHover(event: MouseEvent): void {
    this.showTooltip(event, 'Sales Team', 'Sales team feedback');
  }

  onMarketTrendsHover(event: MouseEvent): void {
    this.showTooltip(event, 'Market Trends', 'External market data');
  }

  onCompetitorAnalysisHover(event: MouseEvent): void {
    this.showTooltip(event, 'Competitor Analysis', 'Competitive intelligence');
  }

  onIndustryBenchmarksHover(event: MouseEvent): void {
    this.showTooltip(event, 'Industry Benchmarks', 'Industry performance data');
  }

  onChannelPerformanceHover(event: MouseEvent): void {
    this.showTooltip(event, 'Channel Performance', 'Channel analytics data');
  }

  getContextualQuestions(sectionTitle: string): string[] {
    const title = sectionTitle.toLowerCase();
    if (title.includes('campaign objective')) {
      return [
        "How did you determine 50,000 downloads is realistic?",
        "Why 8 weeks specifically?",
        "What's the market size for this target?",
        "How does this compare to competitor launches?"
      ];
    }
    return [
      "Tell me more about this section",
      "What data supports this recommendation?",
      "How can we optimize this further?",
      "What are the risks to consider?"
    ];
  }


  initAIChat(): void {
    this.chatMessages = [];
    this.chatMessages.push({
      sender: 'ai',
      text: 'Hi! I\'m your AI assistant for this creative brief. How can I help you?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  initAIChatWithContext(sectionTitle: string, sectionContent: string): void {
    this.chatMessages = [];
    this.chatMessages.push({
      sender: 'ai',
      text: `Perfect! I can see you're interested in the "${sectionTitle}" section. How can I help you understand this better?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    this.initSuggestedQuestions(sectionTitle);
  }

  onChatInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessageToAI();
    }
  }

  sendMessageToAI(): void {
    const messageText = this.chatInputText.trim();
    if (!messageText) return;

    this.addMessageToChat('user', messageText);
    this.chatInputText = '';

    setTimeout(() => {
      const aiResponse = this.generateAIResponse(messageText);
      this.addMessageToChat('ai', aiResponse);
    }, 1000);
  }

  selectSuggestedQuestion(question: string): void {
    this.chatInputText = question;
    this.sendMessageToAI();
  }

  formatMessageText(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  addMessageToChat(sender: 'user' | 'ai', text: string): void {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    this.chatMessages.push({
      sender,
      text: this.formatMessageText(text),
      time: timeString
    });
  }

  generateAIResponse(userInput: string): string {
    const input = userInput.toLowerCase();
    
    if (input.includes('brief') || input.includes('wizard')) {
      return "¡Excelente! El wizard de Creative Brief te ayudará a generar un brief profesional paso a paso. ¿Te gustaría que te explique algún paso específico o tienes preguntas sobre las recomendaciones de IA?";
    }
    
    if (input.includes('recomendación') || input.includes('ai')) {
      return "Las recomendaciones de IA se basan en análisis de datos de más de 10,000 campañas exitosas. Cada sugerencia tiene un score de confianza y está optimizada para tu industria y objetivos específicos.";
    }
    
    return 'Estoy aquí para ayudarte con el Creative Brief. ¿Tienes alguna pregunta específica sobre los pasos del wizard o las recomendaciones?';
  }

  // Helper method to check current step (to work around Angular type checking)
  isCurrentStep(step: number): boolean {
    return this.currentStep === step;
  }
  getBriefSectionContent(sectionId: number): string {
  const section = this.briefSections.find(s => s.id === sectionId);
  if (!section) return '';
  
  if (section.type === 'insights' && section.insights) {
    return section.insights.map(insight => `${insight.title}: ${insight.content}`).join('. ');
  }
  
  return section.content.replace(/<[^>]*>/g, ''); // Remove HTML tags for plain text
}


// ...existing code...

// Método para entrar en modo selección
enterSelectionMode(): void {
  this.selectionMode = true;
  this.selectedSectionIndex = null;
  console.log('Entered selection mode');
}

// Método para salir del modo selección
exitSelectionMode(): void {
  this.selectionMode = false;
  this.selectedSectionIndex = null;
  console.log('Exited selection mode');
}

// Actualizar el método toggleChat
toggleChat(): void {
  if (this.selectionMode) {
    // Si está en modo selección, salir del modo
    this.exitSelectionMode();
    this.chatModalActive = false;
  } else {
    // Si no está en modo selección, entrar en modo selección
    this.enterSelectionMode();
    this.chatModalActive = false; // No abrir el chat aún
  }
}

// Método para manejar click en sección
handleSectionClick(event: Event, sectionTitle: string, sectionContent: string, sectionId: number): void {
  if (!this.selectionMode) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  console.log('Section clicked:', sectionTitle);
  
  // Seleccionar la sección
  this.selectedSectionIndex = sectionId;
  
  // Abrir el chat con contexto
  this.openChat(sectionTitle, sectionContent);
  
  // Salir del modo selección después de un breve delay
  setTimeout(() => {
    this.selectionMode = false;
  }, 300);
}

// Método para abrir chat con contexto
openChat(title: string, content: string): void {
  this.chatModalActive = true;
  
  // Agregar mensaje del usuario automáticamente
  this.addMessageToChat('user'  , `Analyze this section: "${title}"`);
  
  // Simular respuesta de AI
  setTimeout(() => {
    this.addMessageToChat('ai' , `Ill analyze the "${title}" section for you. Based on the content, I can provide insights about...`);
    this.initSuggestedQuestions(title);
  }, 1000);
}

// ...existing code...

}
