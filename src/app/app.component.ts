import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BriefService, BriefSection, InsightCard } from './services/brief.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AppComponent implements OnInit {
  title = 'creative-sync';

  // Loading states
  isLoadingBriefSections = true;
  briefSectionsError: string | null = null;

  // Brief sections - now loaded from service
  briefSections: BriefSection[] = [];

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

  // File upload properties for LLM context
  uploadedFiles: File[] = [];
  maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
  allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ];

  // Creative Brief Wizard properties
  currentStep: number = 1;
  totalSteps: number = 4;
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
    { value: 'professional', label: 'Professional', aiRecommended: false },
    { value: 'friendly', label: 'Friendly', aiRecommended: true },
    { value: 'innovative', label: 'Innovative', aiRecommended: true },
    { value: 'conservative', label: 'Conservative', aiRecommended: false },
    { value: 'youthful', label: 'Youthful', aiRecommended: false },
    { value: 'sophisticated', label: 'Sophisticated', aiRecommended: false },
    { value: 'trustworthy', label: 'Trustworthy', aiRecommended: true },
    { value: 'dynamic', label: 'Dynamic', aiRecommended: false }
  ];

  campaignObjectiveOptions = [
    { value: 'product-launch', label: 'Product Launch', aiRecommended: true },
    { value: 'lead-generation', label: 'Lead Generation', aiRecommended: false },
    { value: 'brand-awareness', label: 'Brand Awareness', aiRecommended: false },
    { value: 'customer-retention', label: 'Customer Retention', aiRecommended: false },
    { value: 'market-expansion', label: 'Market Expansion', aiRecommended: true }
  ];

  contentTypeOptions = [
    { value: 'social-posts', label: 'Social Media Posts', aiRecommended: true },
    { value: 'email-campaign', label: 'Email Campaign', aiRecommended: true },
    { value: 'website', label: 'Website', aiRecommended: false },
    { value: 'video', label: 'Video', aiRecommended: true },
    { value: 'presentation', label: 'Presentation', aiRecommended: false },
    { value: 'article', label: 'Article', aiRecommended: false },
    { value: 'infographic', label: 'Infographic', aiRecommended: false }
  ];

  channelOptions = [
    { value: 'social-media', label: 'Social Media', aiRecommended: true },
    { value: 'paid-ads', label: 'Paid Ads', aiRecommended: true },
    { value: 'email', label: 'Email Marketing', aiRecommended: true },
    { value: 'website', label: 'Website', aiRecommended: false },
    { value: 'events', label: 'Events', aiRecommended: false },
    { value: 'print-media', label: 'Print Media', aiRecommended: false },
    { value: 'influencer', label: 'Influencer Marketing', aiRecommended: false }
  ];

  kpiOptions = [
    { value: 'reach', label: 'Reach', aiRecommended: true },
    { value: 'engagement', label: 'Engagement', aiRecommended: true },
    { value: 'conversions', label: 'Conversions', aiRecommended: true },
    { value: 'brand-awareness', label: 'Brand Awareness', aiRecommended: false },
    { value: 'website-traffic', label: 'Website Traffic', aiRecommended: false },
    { value: 'lead-quality', label: 'Lead Quality', aiRecommended: true }
  ];

  generatedBrief = '';
  isPreviewMode = false;

  constructor(private briefService: BriefService) {}

  ngOnInit(): void {
    // Load brief sections from service
    this.loadBriefSections();

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
      'industry-tech': 'Based on current trends, the tech industry shows 67% higher engagement with visual content',
      'personality-friendly': 'Friendly brands generate 34% more trust in B2B audiences',
      'objective-launch': 'Product launches are more successful with multi-channel strategies',
      'content-video': 'Video content generates 3.2x more engagement than static content',
      'channel-social': 'Social media is ideal for initial reach and engagement'
    };
    return recommendations[field] || 'Recommendation based on data analysis and market trends';
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
          <h3>🏢 Company Information</h3>
          <p><strong>Industry:</strong> ${this.briefData.industry}</p>
          <p><strong>Brand Personality:</strong> ${this.briefData.brandPersonality.join(', ')}</p>
          <p><strong>Key Differentiators:</strong> ${this.briefData.keyDifferentiators}</p>
        </section>

        <section>
          <h3>👥 Target Audience</h3>
          <p><strong>Primary Audience:</strong> ${this.briefData.primaryAudience}</p>
          ${this.briefData.secondaryAudience ? `<p><strong>Secondary Audience:</strong> ${this.briefData.secondaryAudience}</p>` : ''}
          ${this.briefData.culturalConsiderations ? `<p><strong>Cultural Considerations:</strong> ${this.briefData.culturalConsiderations}</p>` : ''}
        </section>

        <section>
          <h3>🎯 Campaign Objectives</h3>
          <p><strong>Main Objective:</strong> ${this.briefData.campaignObjective}</p>
          <p><strong>SMART Goals:</strong> ${this.briefData.smartGoals}</p>
          <p><strong>Problem/Opportunity:</strong> ${this.briefData.businessProblem}</p>
        </section>

        <section>
          <h3>💬 Messages and CTA</h3>
          <p><strong>Main Message:</strong> ${this.briefData.primaryMessage}</p>
          ${this.briefData.secondaryMessages ? `<p><strong>Secondary Messages:</strong> ${this.briefData.secondaryMessages}</p>` : ''}
          <p><strong>Call to Action:</strong> ${this.briefData.callToAction}</p>
        </section>

        <section>
          <h3>📱 Channels and Formats</h3>
          <p><strong>Content Types:</strong> ${this.briefData.contentTypes.join(', ')}</p>
          <p><strong>Channels:</strong> ${this.briefData.channels.join(', ')}</p>
          <p><strong>Geographic Reach:</strong> ${this.briefData.geographicReach}</p>
        </section>

        <section>
          <h3>📅 Timeline</h3>
          <p><strong>Start Date:</strong> ${this.briefData.startDate}</p>
          <p><strong>End Date:</strong> ${this.briefData.endDate}</p>
          ${this.briefData.keyDates ? `<p><strong>Key Dates:</strong> ${this.briefData.keyDates}</p>` : ''}
        </section>

        <section>
          <h3>📊 KPIs and Measurement</h3>
          <p><strong>Success Metrics:</strong> ${this.briefData.successMetrics}</p>
          <p><strong>KPIs:</strong> ${this.briefData.kpis.join(', ')}</p>
          ${this.briefData.estimatedROI ? `<p><strong>Estimated ROI:</strong> ${this.briefData.estimatedROI}</p>` : ''}
        </section>

        <section>
          <h3>💰 Budget</h3>
          <p><strong>Total Budget:</strong> ${this.briefData.budget}</p>
          ${this.briefData.budgetBreakdown ? `<p><strong>Breakdown:</strong> ${this.briefData.budgetBreakdown}</p>` : ''}
        </section>
      </div>
    `;
  }

  // Export Methods
  exportToPDF(): void {
    alert('📄 Exporting to PDF...\n\nIn a real implementation, this would generate a professional PDF of the Creative Brief.');
  }

  exportToPresentation(): void {
    alert('📊 Exporting to Presentation...\n\nIn a real implementation, this would create an executive presentation.');
  }

  exportToText(): void {
    alert('📋 Exporting to Text...\n\nIn a real implementation, this would generate a structured text document.');
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

  // Service-related methods
  loadBriefSections(): void {
    this.isLoadingBriefSections = true;
    this.briefSectionsError = null;

    this.briefService.getBriefSections().subscribe({
      next: (sections) => {
        this.briefSections = sections;
        this.isLoadingBriefSections = false;
        console.log('Brief sections loaded from backend:', sections.length);
      },
      error: (error) => {
        console.error('Error loading from backend:', error);
        
        // Intentar cargar datos mock como fallback
        this.loadMockDataFallback();
      }
    });
  }

  // Método de fallback para cargar datos mock
  private loadMockDataFallback(): void {
    console.log('Usando datos mock como fallback...');
    
    this.briefService.getBriefSectionsMock().subscribe({
      next: (sections) => {
        this.briefSections = sections;
        this.isLoadingBriefSections = false;
        this.briefSectionsError = 'Conectado en modo offline. Usando datos de ejemplo.';
        console.log('Mock brief sections loaded:', sections.length);
      },
      error: (mockError) => {
        this.briefSectionsError = 'Error al cargar datos. Verifique la conexión al backend.';
        this.isLoadingBriefSections = false;
        this.briefSections = [];
        console.error('Error loading mock data:', mockError);
      }
    });
  }

  // Generar nuevo brief con parámetros
  generateNewBrief(params?: any): void {
    this.isLoadingBriefSections = true;
    this.briefSectionsError = null;

    this.briefService.generateBrief(params).subscribe({
      next: (sections) => {
        this.briefSections = sections;
        this.isLoadingBriefSections = false;
        console.log('New brief generated:', sections.length);
      },
      error: (error) => {
        console.error('Error generating brief:', error);
        this.loadMockDataFallback();
      }
    });
  }

  // Recargar secciones
  refreshBriefSections(): void {
    this.loadBriefSections();
  }

  // Buscar secciones
  searchSections(query: string): void {
    if (!query.trim()) {
      this.loadBriefSections();
      return;
    }

    this.isLoadingBriefSections = true;
    this.briefService.searchBriefSections(query).subscribe({
      next: (sections) => {
        this.briefSections = sections;
        this.isLoadingBriefSections = false;
      },
      error: (error) => {
        console.error('Error searching sections:', error);
        this.isLoadingBriefSections = false;
      }
    });
  }

  // Filtrar por categoría
  filterByCategory(category: string): void {
    this.isLoadingBriefSections = true;
    this.briefService.getBriefSectionsByCategory(category).subscribe({
      next: (sections) => {
        this.briefSections = sections;
        this.isLoadingBriefSections = false;
      },
      error: (error) => {
        console.error('Error filtering by category:', error);
        this.isLoadingBriefSections = false;
      }
    });
  }

  // Filtrar por prioridad
  filterByPriority(priority: 'high' | 'medium' | 'low'): void {
    this.isLoadingBriefSections = true;
    this.briefService.getBriefSectionsByPriority(priority).subscribe({
      next: (sections) => {
        this.briefSections = sections;
        this.isLoadingBriefSections = false;
      },
      error: (error) => {
        console.error('Error filtering by priority:', error);
        this.isLoadingBriefSections = false;
      }
    });
  }

  // Agregar nueva sección
  addNewSection(sectionData: Omit<BriefSection, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.briefService.createBriefSection(sectionData).subscribe({
      next: (newSection) => {
        this.briefSections.push(newSection);
        console.log('New section added:', newSection);
      },
      error: (error) => {
        console.error('Error adding section:', error);
      }
    });
  }

  // Actualizar sección existente
  updateSection(sectionId: number, updates: Partial<BriefSection>): void {
    this.briefService.updateBriefSection(sectionId, updates).subscribe({
      next: (updatedSection) => {
        if (updatedSection) {
          const index = this.briefSections.findIndex(s => s.id === sectionId);
          if (index !== -1) {
            this.briefSections[index] = updatedSection;
          }
          console.log('Section updated:', updatedSection);
        }
      },
      error: (error) => {
        console.error('Error updating section:', error);
      }
    });
  }

  // Eliminar sección
  deleteSection(sectionId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta sección?')) {
      this.briefService.deleteBriefSection(sectionId).subscribe({
        next: (success) => {
          if (success) {
            this.briefSections = this.briefSections.filter(s => s.id !== sectionId);
            console.log('Section deleted:', sectionId);
          }
        },
        error: (error) => {
          console.error('Error deleting section:', error);
        }
      });
    }
  }

  // Generar insights con IA
  generateAIInsights(): void {
    this.briefService.generateAIInsights(this.briefData).subscribe({
      next: (insights) => {
        // Crear una nueva sección con los insights generados
        const aiSection: Omit<BriefSection, 'id' | 'createdAt' | 'updatedAt'> = {
          icon: '🤖',
          title: 'AI Generated Insights',
          content: 'Insights generados automáticamente basados en los datos del brief',
          type: 'insights',
          category: 'ai-insights',
          priority: 'high',
          insights: insights
        };

        this.addNewSection(aiSection);
      },
      error: (error) => {
        console.error('Error generating AI insights:', error);
      }
    });
  }
  // Exportar brief
  exportBrief(format: 'pdf' | 'json' | 'docx'): void {
    try {
      let fileName = '';
      let filePath = '';
      
      // Determinar el archivo y ruta según el formato
      switch (format) {
        case 'pdf':
          fileName = 'pdf_Brief.pdf';
          filePath = '/pdf_Brief.pdf'; // Archivo en la carpeta public
          break;
        case 'json':
          fileName = 'creative_brief.json';
          // Para JSON, generamos el contenido dinámicamente
          this.downloadGeneratedJSON();
          return;
        case 'docx':
          fileName = 'creative_brief.docx';
          filePath = '/creative_brief.docx'; // Archivo en la carpeta public
          break;
      }
      
      // Crear enlace de descarga para archivos estáticos (PDF, DOCX)
      const link = document.createElement('a');
      link.href = filePath;
      link.download = fileName;
      link.target = '_blank'; // Abrir en nueva pestaña como respaldo
      
      // Añadir el enlace al DOM temporalmente
      document.body.appendChild(link);
      
      // Hacer clic en el enlace para iniciar la descarga
      link.click();
      
      // Remover el enlace del DOM
      document.body.removeChild(link);
      
      console.log(`Brief descargado como ${format.toUpperCase()}: ${fileName}`);
      
      // Mostrar mensaje de confirmación al usuario
      alert(`✅ Descarga iniciada: ${fileName}\n\nEl archivo se descargará automáticamente en unos segundos.`);
      
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      alert(`❌ Error al descargar el archivo ${format.toUpperCase()}.\n\nPor favor, verifica que el archivo existe en la carpeta del proyecto.`);
    }
  }

  // Método auxiliar para descargar JSON generado dinámicamente
  private downloadGeneratedJSON(): void {
    try {
      // Generar el contenido JSON del brief actual
      const briefJSON = {
        projectInfo: {
          title: 'Creative Brief',
          generatedAt: new Date().toISOString(),
          version: '1.0'
        },
        briefData: this.briefData,
        uploadedFiles: this.uploadedFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        })),
        briefSections: this.briefSections
      };
      
      // Convertir a JSON string
      const jsonString = JSON.stringify(briefJSON, null, 2);
      
      // Crear blob
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Crear URL del blob
      const url = window.URL.createObjectURL(blob);
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = 'creative_brief.json';
      
      // Descargar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Liberar el URL del blob
      window.URL.revokeObjectURL(url);
      
      console.log('Brief JSON generado y descargado exitosamente');
      alert('✅ Brief exportado como JSON exitosamente!');
      
    } catch (error) {
      console.error('Error al generar JSON:', error);
      alert('❌ Error al generar el archivo JSON.');
    }
  }

  // Sincronizar con stakeholders
  syncWithStakeholders(): void {
    this.briefService.syncWithStakeholders().subscribe({
      next: (syncResult) => {
        console.log('Sync completed:', syncResult);
        alert(`Sincronización completada. Última sincronización: ${syncResult.lastSync.toLocaleString()}`);
      },
      error: (error) => {
        console.error('Error syncing:', error);
        alert('Error al sincronizar con stakeholders');
      }
    });
  }

  // ...existing methods...

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

  // Network interaction methods
  onQuestionHover(event: MouseEvent, questionTitle: string, answer: string): void {
    const tooltipContent = `
      <div class="question-tooltip">
        <h4>${questionTitle}</h4>
        <p><strong>Respuesta:</strong> ${answer}</p>
        <span class="source-badge">🎨 Design Team Input</span>
      </div>
    `;
    this.showTooltip(event, questionTitle, tooltipContent);
  }

  getContextualQuestions(sectionTitle: string): string[] {
    const title = sectionTitle.toLowerCase();
    
    if (title.includes('business and brand information') || title.includes('business')) {
      return [
        "How will the uploaded documents influence AI recommendations?",
        "What brand personality traits work best for our industry?",
        "How do you validate brand guidelines alignment?",
        "Can you analyze our competitive positioning?"
      ];
    }
    
    if (title.includes('target audience') || title.includes('audiencia')) {
      return [
        "How did you determine these demographic segments?",
        "What's the confidence level for these audience insights?",
        "How does our audience compare to competitors?",
        "What behavioral patterns should influence messaging?"
      ];
    }
    
    if (title.includes('campaign objective') || title.includes('objetivo')) {
      return [
        "How did you determine 50,000 downloads is realistic?",
        "Why 8 weeks specifically for this campaign?",
        "What's the market size analysis behind this target?",
        "How does this compare to competitor launch performance?"
      ];
    }
    
    if (title.includes('messages') || title.includes('messaging') || title.includes('call to action')) {
      return [
        "What psychological triggers are built into this messaging?",
        "How was the call-to-action optimized for conversions?",
        "What A/B test variations would you recommend?",
        "How does this messaging differentiate from competitors?"
      ];
    }
    
    if (title.includes('channels') || title.includes('formats')) {
      return [
        "Why these specific channels for our audience?",
        "What's the expected performance for each channel?",
        "How was the budget allocation optimized?",
        "What's the attribution model for multi-channel tracking?"
      ];
    }
    
    if (title.includes('timeline') || title.includes('dates')) {
      return [
        "How does this timeline align with industry cycles?",
        "What are the critical path dependencies?",
        "How much buffer time is built into the schedule?",
        "What external factors influenced these dates?"
      ];
    }
    
    if (title.includes('measurement') || title.includes('kpis')) {
      return [
        "How were these KPI targets benchmarked?",
        "What's the attribution model for measuring success?",
        "How often should we review and optimize?",
        "What leading indicators predict campaign success?"
      ];
    }
    
    if (title.includes('budget') || title.includes('considerations')) {
      return [
        "How was this budget allocation optimized?",
        "What's the expected ROI timeline?",
        "How does spend distribution compare to benchmarks?",
        "What contingency plans exist for budget adjustments?"
      ];
    }
    
    // Preguntas por defecto
    return [
      "What data supports these recommendations?",
      "How can we optimize this section further?",
      "What are the potential risks and mitigation strategies?",
      "How does this align with industry best practices?"
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
    
    // Detectar si se está analizando una sección específica
    if (input.includes('analyze this section')) {
      return this.generateSectionAnalysis(input);
    }
    
    // Respuestas contextuales basadas en keywords
    if (input.includes('campaign objective') || input.includes('objetivo')) {
      return `Perfect! I can see you're interested in the "🎯 Campaign Objective" section. I have all the context about this part of the brief and can explain the reasoning, suggest improvements, or answer any specific questions you have about this section.

🎯 **Campaign Objective Analysis:**

This objective was crafted based on:
• Market size analysis showing 2.3M healthcare practices in the US
• Competitor benchmarks indicating 50K downloads is achievable for healthcare SaaS  
• 8-week timeline aligns with healthcare decision cycles
• Focus on 'small business owners' targets the underserved SMB market

The objective balances ambition with realism. Would you like me to explain the market research behind these numbers?`;
    }
    
    if (input.includes('target audience') || input.includes('audiencia')) {
      return `Excellent! Let's dive into the "👥 Target Audience" section. This is one of the most critical components of your creative brief.

👥 **Target Audience Deep Dive:**

Primary audience profile was built from:
• Demographics: Healthcare professionals aged 28-45
• Psychographics: Efficiency-oriented, patient-focused
• Behavioral patterns: 73% use mobile apps for practice management
• Pain points: Average 2.5 hours daily on administrative tasks

**Key Insights:**
• 68% are willing to pay for time-saving solutions
• Trust peer recommendations 4x more than advertising
• Prefer trial periods over demos (67% vs 23%)

This audience responds best to outcome-focused messaging. Should I elaborate on the persona development process?`;
    }
    
    if (input.includes('channels') || input.includes('canales')) {
      return `Great choice! The "📱 Channels and Formats" section is where strategy meets execution.

📱 **Channel Strategy Analysis:**

Recommended channel mix based on:
• **LinkedIn (40% budget):** 89% of healthcare decision makers are active
• **Medical publications (25%):** High trust factor in healthcare industry  
• **Google Ads (20%):** 94% search before software purchases
• **Email marketing (15%):** 6.2x ROI in B2B healthcare

**Performance predictions:**
• LinkedIn: 12% engagement rate (vs 2.3% industry avg)
• Medical pubs: 34% click-through rate
• Google Ads: $2.80 CPC with 15% conversion rate

The multi-channel approach reduces risk while maximizing reach. Want to explore the attribution model?`;
    }
    
    if (input.includes('budget') || input.includes('presupuesto')) {
      return `Perfect! The "💰 Budget and Allocation" section is crucial for campaign success.

💰 **Budget Strategy Breakdown:**

Total budget allocation ($50,000):
• **Paid media (40% - $20k):** Maximum reach during launch window
• **Content production (30% - $15k):** High-quality assets for conversion
• **Creative development (20% - $10k):** Professional design and copy
• **Tools & analytics (10% - $5k):** Measurement and optimization

**ROI Projections:**
• Cost per acquisition: $85-120 (industry benchmark: $150)
• Expected conversions: 350-400 downloads
• Customer lifetime value: $2,400
• Projected ROI: 285% over 6 months

This allocation follows the 40-30-20-10 rule proven in healthcare software launches. Would you like to see the month-by-month spending plan?`;
    }
    
    if (input.includes('timeline') || input.includes('tiempo')) {
      return `Excellent focus on the "📅 Timeline and Milestones" section! Timing is everything in B2B healthcare.

📅 **Strategic Timeline Analysis:**

**8-week launch window chosen because:**
• Healthcare purchase cycles average 6-8 weeks
• Avoids summer vacation period (July-August)  
• Aligns with Q3 budget allocation cycles
• Allows for 2-week pre-launch buzz building

**Critical milestones:**
• Week 1-2: Creative production & audience setup
• Week 3-4: Soft launch with limited audience
• Week 5-6: Full campaign activation
• Week 7-8: Optimization and scale-up

**Key dates to avoid:**
• Medical conferences (AMA Annual Meeting - June 10-14)
• Holiday periods affecting decision makers
• End-of-quarter busy periods

The timeline incorporates 15% buffer time for unexpected delays. Should I break down the week-by-week action plan?`;
    }
    
    if (input.includes('kpi') || input.includes('measurement') || input.includes('metrics')) {
      return `Great question about the "📊 KPIs and Measurement" framework!

📊 **Measurement Strategy Deep Dive:**

**Primary KPIs (North Star Metrics):**
• Download conversions: Target 50,000 (tracking: Google Analytics + UTM)
• Cost per acquisition: $85-120 (tracking: Campaign manager + CRM)
• Trial-to-paid conversion: 18% (tracking: Product analytics)

**Secondary KPIs (Leading Indicators):**
• Email signup rate: 12% (industry avg: 8%)
• Content engagement: 8+ minutes avg. session time
• LinkedIn engagement: 12% rate (vs 2.3% baseline)

**Attribution Model:**
• First-touch: 30% weight (awareness campaigns)
• Multi-touch: 40% weight (nurture sequences)  
• Last-touch: 30% weight (conversion campaigns)

**Reporting cadence:** Weekly tactical, bi-weekly strategic, monthly executive summary.

The measurement framework includes cohort analysis for long-term insights. Want to see the dashboard mockup?`;
    }
    
    if (input.includes('files') || input.includes('context') || input.includes('documents')) {
      return `Great question about the uploaded context documents! These files are crucial for AI-powered brief generation.

📄 **Context Documents Analysis:**

The uploaded files will enhance AI recommendations by:
• **Brand guidelines:** Ensuring visual and tone consistency
• **Previous campaigns:** Learning from past performance data
• **Market research:** Incorporating industry-specific insights
• **Competitor analysis:** Identifying differentiation opportunities

**AI Processing Benefits:**
• 73% more accurate audience targeting when brand docs included
• 45% better message-market fit with previous campaign data
• 62% improvement in channel selection with industry research

The AI analyzes document content, extracts key insights, and applies them contextually throughout the brief generation process. This ensures your brief isn't generic but tailored to your specific brand and market position.

Would you like me to explain how the AI processes each document type?`;
    }
    
    // Respuestas generales
    if (input.includes('brief') || input.includes('wizard')) {
      return "¡Excelente! El wizard de Creative Brief te ayudará a generar un brief profesional paso a paso. ¿Te gustaría que te explique algún paso específico o tienes preguntas sobre las recomendaciones de IA?";
    }
    
    if (input.includes('recomendación') || input.includes('ai') || input.includes('recommendation')) {
      return "Las recomendaciones de IA se basan en análisis de datos de más de 10,000 campañas exitosas. Cada sugerencia tiene un score de confianza y está optimizada para tu industria y objetivos específicos.";
    }
    
    return 'I\'m here to help you with your Creative Brief! I can provide detailed analysis of any section, explain AI recommendations, or answer specific questions about strategy, tactics, or implementation. What would you like to explore?';
  }

  generateSectionAnalysis(input: string): string {
    // Extraer el título de la sección del input
    const sectionMatch = input.match(/"([^"]+)"/);
    const sectionTitle = sectionMatch ? sectionMatch[1] : '';
    
    if (sectionTitle.includes('Campaign Objective') || sectionTitle.includes('objetivo')) {
      return `Perfect! I can see you're interested in the "${sectionTitle}" section. I have all the context about this part of the brief and can explain the reasoning, suggest improvements, or answer any specific questions you have about this section.

🎯 **Campaign Objective Analysis:**

This objective was crafted based on:
• Market size analysis showing 2.3M healthcare practices in the US
• Competitor benchmarks indicating 50K downloads is achievable for healthcare SaaS
• 8-week timeline aligns with healthcare decision cycles  
• Focus on 'small business owners' targets the underserved SMB market

The objective balances ambition with realism. Would you like me to explain the market research behind these numbers?`;
    }
    
    if (sectionTitle.includes('Target Audience') || sectionTitle.includes('audiencia')) {
      return `Perfect! I can see you're interested in the "${sectionTitle}" section. This is the foundation of effective campaign strategy.

👥 **Target Audience Analysis:**

This audience definition was built using:
• Healthcare industry data from 15+ sources
• User research with 200+ healthcare professionals
• Competitive analysis of successful healthcare SaaS
• Behavioral analytics from similar product launches

**Key insights that shaped this audience:**
• 68% prefer efficiency over feature complexity
• Trust peer recommendations 4x more than ads
• 73% research solutions during non-patient hours
• Average 2.5 hours daily on administrative tasks

Would you like me to dive deeper into the persona development methodology?`;
    }
    
    // Respuesta genérica para otras secciones
    return `Perfect! I can see you're interested in the "${sectionTitle}" section. I have comprehensive context about this part of the brief and can provide detailed analysis, explain the strategic reasoning, or answer any specific questions you have.

Let me know what aspect you'd like to explore further - the data behind the recommendations, optimization opportunities, or implementation details!`;
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
  this.addMessageToChat('user', `Analyze this section: "${title}"`);
  
  // Simular respuesta de AI con información contextual mejorada
  setTimeout(() => {
    let aiResponse = '';
    
    // Si hay archivos subidos, mencionar su valor para el contexto
    if (this.uploadedFiles.length > 0 && title.includes('Business and Brand Information')) {
      aiResponse = `Perfect! I can see you're interested in the "${title}" section and you've uploaded ${this.uploadedFiles.length} context document(s). This is excellent as these files will significantly enhance the AI's understanding of your brand.

📄 **Uploaded Context Analysis:**
${this.uploadedFiles.map(file => `• ${this.getFileIcon(file.type)} ${file.name} (${this.formatFileSize(file.size)})`).join('\n')}

These documents will help me provide more accurate recommendations throughout the brief generation process. The AI will analyze these files to understand your brand guidelines, previous campaign performance, and industry-specific context.

${this.generateSectionAnalysis(`"${title}"`)}`;
    } else {
      aiResponse = this.generateSectionAnalysis(`"${title}"`);
    }
    
    this.addMessageToChat('ai', aiResponse);
    this.initSuggestedQuestions(title);
  }, 1000);
}  // Additional utility methods
  trackBriefSection(index: number, section: BriefSection): number {
    return section.id;
  }

  trackInsightCard(index: number, insight: InsightCard): string {
    return insight.title;
  }

  editSection(section: BriefSection): void {
    // Implementar lógica de edición
    console.log('Editing section:', section);
    alert(`Editando sección: ${section.title}\n\nEn una implementación real, esto abriría un modal de edición.`);
  }

  // File upload methods for LLM context enhancement
  triggerFileUpload(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer?.files) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  processFiles(files: File[]): void {
    for (const file of files) {
      if (this.validateFile(file)) {
        // Check if file already exists
        const existingFile = this.uploadedFiles.find(f => f.name === file.name && f.size === file.size);
        if (!existingFile) {
          this.uploadedFiles.push(file);
        }
      }
    }
  }

  validateFile(file: File): boolean {
    // Check file size
    if (file.size > this.maxFileSize) {
      alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
      return false;
    }

    // Check file type
    if (!this.allowedFileTypes.includes(file.type)) {
      alert(`File "${file.name}" is not a supported format. Please upload PDF, DOC, DOCX, TXT, PNG, or JPG files.`);
      return false;
    }

    return true;
  }

  removeFile(index: number, event: Event): void {
    event.stopPropagation();
    this.uploadedFiles.splice(index, 1);
  }

  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('text')) return '📋';
    if (fileType.includes('image')) return '🖼️';
    return '📁';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Method to get file context for LLM processing (for future implementation)
  getUploadedFilesContext(): string {
    if (this.uploadedFiles.length === 0) return '';
    
    return `Context files uploaded: ${this.uploadedFiles.map(file => file.name).join(', ')}. ` +
           `These documents should be considered when generating the creative brief to ensure ` +
           `alignment with existing brand guidelines, previous campaign insights, and specific company context.`;
  }

  hasUpdatedSections(): boolean {
    return this.briefSections.some(section => section.updatedAt);
  }

  getLatestUpdate(): Date | null {
    const updatedSections = this.briefSections.filter(section => section.updatedAt);
    if (updatedSections.length === 0) return null;
    
    return updatedSections.reduce((latest, section) => {
      if (!latest || !section.updatedAt) return section.updatedAt || null;
      return section.updatedAt > latest ? section.updatedAt : latest;
    }, null as Date | null);
  }
}
