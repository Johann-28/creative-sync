# PDF Generator Simplificado - Solo ReportLab (Sin WeasyPrint)
# Solución para Windows/Hackathon sin dependencias complicadas

import asyncio
from datetime import datetime
from typing import Dict, Any
import json
import os

# Solo ReportLab - más confiable para hackathons
try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.colors import Color, HexColor
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
    from reportlab.pdfgen import canvas
    from reportlab.lib import colors
    print("✅ ReportLab importado correctamente")
except ImportError as e:
    print(f"❌ Error importando ReportLab: {e}")
    print("💡 Instala con: pip install reportlab")
    exit(1)

class EdgeVerveBrandColors:
    """Colores EdgeVerve actualizados - Branding oficial"""
    
    # Colores principales EdgeVerve
    NAVY_BLUE = HexColor('#003366')       # Azul oscuro principal
    CYAN_ACCENT = HexColor('#00BFFF')     # Azul claro/cian acento
    DARK_NAVY = HexColor('#002244')       # Navy más oscuro para títulos
    LIGHT_CYAN = HexColor('#66D9FF')      # Cian claro para backgrounds
    
    # Colores de soporte
    WHITE = HexColor('#ffffff')
    LIGHT_GRAY = HexColor('#f7f9fc')      # Gris muy claro
    MEDIUM_GRAY = HexColor('#6b7280')     # Gris medio
    DARK_GRAY = HexColor('#374151')       # Gris oscuro para texto
    BLACK = HexColor('#1f2937')           # Negro suave
    
    # Estados
    SUCCESS = HexColor('#10b981')
    WARNING = HexColor('#f59e0b')

class SimplePDFGenerator:
    """Generador PDF simplificado para hackathons"""
    
    def __init__(self):
        self.colors = EdgeVerveBrandColors()
        self.styles = self._create_styles()
    
    def _create_styles(self):
        """Crea estilos profesionales EdgeVerve con branding actualizado"""
        styles = getSampleStyleSheet()
        
        # Título principal - EdgeVerve
        styles.add(ParagraphStyle(
            name='EdgeVerveTitle',
            parent=styles['Title'],
            fontSize=28,
            spaceAfter=15,
            spaceBefore=10,
            textColor=self.colors.DARK_NAVY,
            fontName='Helvetica-Bold',
            alignment=TA_CENTER,
            backColor=self.colors.LIGHT_GRAY,
            borderColor=self.colors.CYAN_ACCENT,
            borderWidth=2,
            borderPadding=15
        ))
        
        # Subtítulo con acento cian
        styles.add(ParagraphStyle(
            name='EdgeVerveSubtitle',
            parent=styles['Normal'],
            fontSize=14,
            spaceAfter=20,
            textColor=self.colors.CYAN_ACCENT,
            fontName='Helvetica-Bold',
            alignment=TA_CENTER
        ))
        
        # Headers de sección - Navy con línea cian
        styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=10,
            spaceBefore=25,
            textColor=self.colors.NAVY_BLUE,
            fontName='Helvetica-Bold',
            borderColor=self.colors.CYAN_ACCENT,
            borderWidth=0,
            leftIndent=0,
            backColor=self.colors.WHITE
        ))
        
        # Sub-headers con acento cian
        styles.add(ParagraphStyle(
            name='SubHeader',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=8,
            spaceBefore=12,
            textColor=self.colors.CYAN_ACCENT,
            fontName='Helvetica-Bold',
            leftIndent=20
        ))
        
        # Texto del body - limpio y legible (NOMBRE CAMBIADO)
        styles.add(ParagraphStyle(
            name='EdgeVerveBodyText',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=8,
            leading=16,
            textColor=self.colors.DARK_GRAY,
            fontName='Helvetica',
            alignment=TA_JUSTIFY,
            leftIndent=10,
            rightIndent=10
        ))
        
        # Texto destacado con branding EdgeVerve
        styles.add(ParagraphStyle(
            name='Highlight',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=12,
            spaceBefore=12,
            textColor=self.colors.NAVY_BLUE,
            fontName='Helvetica-Bold',
            backColor=self.colors.LIGHT_CYAN,
            borderColor=self.colors.CYAN_ACCENT,
            borderWidth=1,
            borderPadding=12,
            alignment=TA_LEFT
        ))
        
        # Quote/Insight box
        styles.add(ParagraphStyle(
            name='InsightBox',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=15,
            spaceBefore=15,
            textColor=self.colors.DARK_NAVY,
            fontName='Helvetica',
            backColor=self.colors.LIGHT_GRAY,
            borderColor=self.colors.NAVY_BLUE,
            borderWidth=2,
            borderPadding=15,
            leftIndent=20,
            rightIndent=20
        ))
        
        # Footer EdgeVerve
        styles.add(ParagraphStyle(
            name='Footer',
            parent=styles['Normal'],
            fontSize=9,
            textColor=self.colors.MEDIUM_GRAY,
            fontName='Helvetica',
            alignment=TA_CENTER
        ))
        
        return styles
    
    def generate_brief_pdf(self, brief_content: str, stakeholder_data: Dict, research_data: Dict = None, output_path: str = None) -> str:
        """
        Genera PDF del creative brief con branding EdgeVerve
        
        Args:
            brief_content: Contenido del brief generado por LLM
            stakeholder_data: Datos de stakeholders
            research_data: Datos de research (opcional)
            output_path: Ruta de salida (opcional)
            
        Returns:
            str: Ruta del PDF generado
        """
        
        # Generar nombre de archivo si no se proporciona
        if not output_path:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            company_name = stakeholder_data.get('nombre_empresa', 'EdgeVerve').replace(' ', '_')
            output_path = f"creative_brief_{company_name}_{timestamp}.pdf"
        
        print(f"🎨 Generando PDF: {output_path}")
        
        # Crear documento
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            topMargin=1*inch,
            bottomMargin=1*inch,
            leftMargin=0.75*inch,
            rightMargin=0.75*inch
        )
        
        # Construir contenido
        story = []
        
        # 1. Header profesional
        story.extend(self._create_header(stakeholder_data))
        
        # 2. Contenido principal del brief
        story.extend(self._create_main_content(brief_content))
        
        # 3. Research insights (si existen)
        if research_data:
            story.extend(self._create_research_section(research_data))
        
        # 4. Footer con metadatos
        story.extend(self._create_footer(stakeholder_data, research_data))
        
        # Generar PDF
        try:
            doc.build(story)
            print(f"✅ PDF generado exitosamente: {output_path}")
            return output_path
        except Exception as e:
            print(f"❌ Error generando PDF: {e}")
            return None
    
    def _create_header(self, data: Dict) -> list:
        """Crea header con branding EdgeVerve moderno"""
        story = []
        
        # Header con logo EdgeVerve estilizado
        header_data = [
            ['', ''],  # Espacio para logo
            ['EdgeVerve', 'Creative Intelligence Platform'],
        ]
        
        header_table = Table(header_data, colWidths=[1*inch, 5*inch])
        header_table.setStyle(TableStyle([
            # Fila del logo/branding
            ('FONTNAME', (0, 1), (0, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (0, 1), 20),
            ('TEXTCOLOR', (0, 1), (0, 1), self.colors.NAVY_BLUE),
            ('FONTNAME', (1, 1), (1, 1), 'Helvetica'),
            ('FONTSIZE', (1, 1), (1, 1), 12),
            ('TEXTCOLOR', (1, 1), (1, 1), self.colors.CYAN_ACCENT),
            ('ALIGN', (0, 1), (-1, 1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            # Línea separadora
            ('LINEBELOW', (0, 1), (-1, 1), 2, self.colors.CYAN_ACCENT),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 1), (-1, 1), 10),
        ]))
        
        story.append(header_table)
        story.append(Spacer(1, 25))
        
        # Título principal del documento
        company_name = data.get('nombre_empresa', 'EdgeVerve AI Next')
        story.append(Paragraph(
            f"{company_name}<br/><font size='16' color='#00BFFF'>CREATIVE BRIEF</font>",
            self.styles['EdgeVerveTitle']
        ))
        
        story.append(Spacer(1, 20))
        
        # Información del proyecto en tabla moderna
        project_info = [
            ['PROYECTO', company_name],
            ['FECHA', datetime.now().strftime("%d de %B, %Y")],
            ['VERSIÓN', 'v1.0 - AI Generated'],
            ['PLATAFORMA', 'EdgeVerve Agentic AI System']
        ]
        
        info_table = Table(project_info, colWidths=[1.5*inch, 4*inch])
        info_table.setStyle(TableStyle([
            # Headers
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (0, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), self.colors.NAVY_BLUE),
            # Contenido
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (1, 0), (1, -1), 10),
            ('TEXTCOLOR', (1, 0), (1, -1), self.colors.DARK_GRAY),
            # Formato
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [self.colors.WHITE, self.colors.LIGHT_GRAY]),
            ('GRID', (0, 0), (-1, -1), 0.5, self.colors.MEDIUM_GRAY),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ]))
        
        story.append(info_table)
        story.append(Spacer(1, 30))
        
        return story
    
    def _create_main_content(self, brief_content: str) -> list:
        """Procesa y formatea el contenido principal con estilo EdgeVerve"""
        story = []
        
        # Dividir contenido en secciones
        sections = self._parse_brief_content(brief_content)
        
        for i, (section_title, section_content) in enumerate(sections):
            # Título de sección con línea decorativa
            section_title_clean = section_title.replace('**', '').strip()
            
            # Crear título con línea cian
            title_data = [[f"📋 {section_title_clean.upper()}"]]
            title_table = Table(title_data, colWidths=[6*inch])
            title_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (0, 0), 16),
                ('TEXTCOLOR', (0, 0), (0, 0), self.colors.NAVY_BLUE),
                ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                ('VALIGN', (0, 0), (0, 0), 'MIDDLE'),
                ('LINEBELOW', (0, 0), (0, 0), 3, self.colors.CYAN_ACCENT),
                ('TOPPADDING', (0, 0), (0, 0), 10),
                ('BOTTOMPADDING', (0, 0), (0, 0), 15),
                ('LEFTPADDING', (0, 0), (0, 0), 0),
            ]))
            
            story.append(title_table)
            story.append(Spacer(1, 10))
            
            # Contenido de la sección
            if section_content.strip():
                # Detectar si es contenido destacado (objetivos, insights, etc.)
                is_highlight = any(keyword in section_title.lower() 
                                for keyword in ['objective', 'key message', 'diferenciador'])
                
                style_to_use = self.styles['Highlight'] if is_highlight else self.styles['EdgeVerveBodyText']
                
                # Procesar subsecciones si existen
                if self._has_subsections(section_content):
                    subsections = self._parse_subsections(section_content)
                    for sub_title, sub_content in subsections:
                        if sub_title:
                            story.append(Paragraph(
                                f"<font color='#00BFFF'><b>▶</b></font> <b>{sub_title}</b>",
                                self.styles['SubHeader']
                            ))
                        if sub_content:
                            story.append(Paragraph(
                                self._format_content(sub_content),
                                self.styles['EdgeVerveBodyText']
                            ))
                            story.append(Spacer(1, 8))
                else:
                    story.append(Paragraph(
                        self._format_content(section_content),
                        style_to_use
                    ))
            
            story.append(Spacer(1, 20))
            
            # Separador entre secciones principales
            if i < len(sections) - 1:
                separator_data = [['&nbsp;']]
                separator_table = Table(separator_data, colWidths=[6*inch])
                separator_table.setStyle(TableStyle([
                    ('LINEABOVE', (0, 0), (0, 0), 1, self.colors.LIGHT_CYAN),
                    ('TOPPADDING', (0, 0), (0, 0), 10),
                    ('BOTTOMPADDING', (0, 0), (0, 0), 10),
                ]))
                story.append(separator_table)
        
        return story
    
    def _parse_brief_content(self, content: str) -> list:
        """Parsea el contenido del brief en secciones"""
        sections = []
        current_section = ""
        current_content = ""
        
        lines = content.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Detectar títulos de sección (líneas que terminan con ** o son títulos evidentes)
            if (line.startswith('**') and line.endswith('**')) or \
               any(keyword in line.lower() for keyword in ['objective', 'audience', 'background', 'problem', 'solution', 'channel']):
                
                # Guardar sección anterior
                if current_section:
                    sections.append((current_section, current_content))
                
                # Iniciar nueva sección
                current_section = line.replace('**', '').strip()
                current_content = ""
            else:
                current_content += line + "\n"
        
        # Agregar última sección
        if current_section:
            sections.append((current_section, current_content))
        
        return sections
    
    def _has_subsections(self, content: str) -> bool:
        """Detecta si el contenido tiene subsecciones"""
        return any(line.strip().startswith(('1.', '2.', '3.', 'A.', 'B.', 'C.')) 
                  for line in content.split('\n'))
    
    def _parse_subsections(self, content: str) -> list:
        """Parsea subsecciones dentro de una sección"""
        subsections = []
        current_sub = ""
        current_content = ""
        
        lines = content.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Detectar subsección
            if line.startswith(('1.', '2.', '3.', 'A.', 'B.', 'C.', '•', '*')):
                if current_sub:
                    subsections.append((current_sub, current_content))
                
                current_sub = line
                current_content = ""
            else:
                current_content += line + "\n"
        
        if current_sub:
            subsections.append((current_sub, current_content))
        
        return subsections
    
    def _format_content(self, content: str) -> str:
        """Clean content to avoid HTML parsing errors"""
        import re
        
        # First, clean the content completely
        formatted = content.strip()
        
        # Remove any existing HTML/XML tags to start fresh
        formatted = re.sub(r'<[^>]*>', '', formatted)
        
        # Escape HTML special characters
        formatted = formatted.replace('&', '&amp;')
        formatted = formatted.replace('<', '&lt;')
        formatted = formatted.replace('>', '&gt;')
        
        # Handle bullet points and special characters
        formatted = formatted.replace('•', '&#8226;')
        formatted = formatted.replace('- ', '&#8226; ')
        
        # Remove any problematic unicode characters that might cause issues
        formatted = formatted.encode('ascii', 'ignore').decode('ascii')
        
        # Convert basic markdown-style formatting CAREFULLY
        # Only handle properly paired markers
        lines = formatted.split('\n')
        cleaned_lines = []
        
        for line in lines:
            # Handle bold text - ensure proper pairing
            while '**' in line:
                first_pos = line.find('**')
                if first_pos != -1:
                    second_pos = line.find('**', first_pos + 2)
                    if second_pos != -1:
                        # Found a pair
                        before = line[:first_pos]
                        bold_text = line[first_pos + 2:second_pos]
                        after = line[second_pos + 2:]
                        line = before + f'<b>{bold_text}</b>' + after
                    else:
                        # No closing **, remove the opening one
                        line = line.replace('**', '', 1)
                        
            # Handle italic text
            while '*' in line and '**' not in line:
                first_pos = line.find('*')
                if first_pos != -1:
                    second_pos = line.find('*', first_pos + 1)
                    if second_pos != -1:
                        before = line[:first_pos]
                        italic_text = line[first_pos + 1:second_pos]
                        after = line[second_pos + 1:]
                        line = before + f'<i>{italic_text}</i>' + after
                    else:
                        line = line.replace('*', '', 1)
                        
            cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines)
    
    def _create_research_section(self, research_data: Dict) -> list:
        """Crea sección con insights de research con estilo EdgeVerve"""
        story = []
        
        # Título de la sección AI Research
        ai_title_data = [["🤖 AI RESEARCH INSIGHTS"]]
        ai_title_table = Table(ai_title_data, colWidths=[6*inch])
        ai_title_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (0, 0), 18),
            ('TEXTCOLOR', (0, 0), (0, 0), self.colors.NAVY_BLUE),
            ('ALIGN', (0, 0), (0, 0), 'CENTER'),
            ('VALIGN', (0, 0), (0, 0), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (0, 0), self.colors.LIGHT_GRAY),
            ('LINEBELOW', (0, 0), (0, 0), 3, self.colors.CYAN_ACCENT),
            ('TOPPADDING', (0, 0), (0, 0), 15),
            ('BOTTOMPADDING', (0, 0), (0, 0), 15),
        ]))
        
        story.append(ai_title_table)
        story.append(Spacer(1, 20))
        
        # Crear grid de insights
        insights = []
        
        # Competitor insights
        if 'competitor_analysis' in research_data:
            comp_data = research_data['competitor_analysis']
            competitors = [comp.get('name', 'N/A') for comp in comp_data.get('top_competitors', [])[:3]]
            if competitors:
                insights.append([
                    "🏢 COMPETIDORES",
                    ', '.join(competitors)
                ])
        
        # Market trends
        if 'market_trends' in research_data:
            trends = research_data['market_trends'].get('industry_trends', {})
            growth = trends.get('growth_rate', 'N/A')
            if growth != 'N/A':
                insights.append([
                    "📈 CRECIMIENTO",
                    growth
                ])
                
            hot_topics = trends.get('hot_topics', [])
            if hot_topics:
                insights.append([
                    "🔥 TENDENCIAS",
                    ', '.join(hot_topics[:3])
                ])
        
        # Audience insights
        if 'audience_insights' in research_data:
            audience = research_data['audience_insights']
            channels = audience.get('channel_preferences', {}).get('primary_channels', [])
            if channels:
                insights.append([
                    "📱 CANALES",
                    ', '.join(channels[:3])
                ])
        
        # Crear tabla de insights
        if insights:
            insights_table = Table(insights, colWidths=[1.5*inch, 4*inch])
            insights_table.setStyle(TableStyle([
                # Headers
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (0, -1), 10),
                ('TEXTCOLOR', (0, 0), (0, -1), self.colors.CYAN_ACCENT),
                # Contenido
                ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                ('FONTSIZE', (1, 0), (1, -1), 10),
                ('TEXTCOLOR', (1, 0), (1, -1), self.colors.DARK_GRAY),
                # Formato
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ROWBACKGROUNDS', (0, 0), (-1, -1), [self.colors.WHITE, self.colors.LIGHT_GRAY]),
                ('GRID', (0, 0), (-1, -1), 1, self.colors.CYAN_ACCENT),
                ('TOPPADDING', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                ('LEFTPADDING', (0, 0), (-1, -1), 15),
            ]))
            
            story.append(insights_table)
        
        story.append(Spacer(1, 25))
        
        return story
    
    def _create_footer(self, stakeholder_data: Dict, research_data: Dict) -> list:
        """Crea footer con branding EdgeVerve"""
        story = []
        
        # Separador final
        story.append(Spacer(1, 30))
        
        footer_data = [['&nbsp;']]
        footer_separator = Table(footer_data, colWidths=[6*inch])
        footer_separator.setStyle(TableStyle([
            ('LINEABOVE', (0, 0), (0, 0), 2, self.colors.NAVY_BLUE),
            ('TOPPADDING', (0, 0), (0, 0), 15),
            ('BOTTOMPADDING', (0, 0), (0, 0), 10),
        ]))
        story.append(footer_separator)
        
        # Footer information
        agents_used = ['Competitor Research', 'Market Trends', 'Audience Analysis', 'Brief Generation']
        research_time = research_data.get('research_time_seconds', 'N/A') if research_data else 'N/A'
        
        footer_info = [
            ['GENERADO POR:', 'EdgeVerve Creative Intelligence Platform'],
            ['AGENTES AI:', ' • '.join(agents_used)],
            ['TIEMPO DE RESEARCH:', f'{research_time} segundos'],
            ['FECHA:', datetime.now().strftime("%d/%m/%Y a las %H:%M:%S")]
        ]
        
        footer_table = Table(footer_info, colWidths=[1.5*inch, 4*inch])
        footer_table.setStyle(TableStyle([
            # Headers
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (0, -1), 8),
            ('TEXTCOLOR', (0, 0), (0, -1), self.colors.NAVY_BLUE),
            # Contenido
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (1, 0), (1, -1), 8),
            ('TEXTCOLOR', (1, 0), (1, -1), self.colors.MEDIUM_GRAY),
            # Formato
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ]))
        
        story.append(footer_table)
        
        # Logo/brand final
        story.append(Spacer(1, 15))
        story.append(Paragraph(
            "<b>EdgeVerve</b> | <font color='#00BFFF'>Empowering Business with AI</font>",
            self.styles['Footer']
        ))
        
        return story

# =============================================================================
# FUNCIÓN SIMPLIFICADA PARA INTEGRACIÓN
# =============================================================================

def generate_pdf_from_brief(brief_content: str, stakeholder_inputs: Dict, research_data: Dict = None, output_path: str = None) -> str:
    """
    Función simplificada para generar PDF desde el sistema agentic
    
    Args:
        brief_content: Brief generado por LLM
        stakeholder_inputs: Datos de stakeholders
        research_data: Datos de research (opcional)
        output_path: Ruta de salida (opcional)
        
    Returns:
        str: Ruta del archivo PDF generado
    """
    
    generator = SimplePDFGenerator()
    
    return generator.generate_brief_pdf(
        brief_content=brief_content,
        stakeholder_data=stakeholder_inputs,
        research_data=research_data,
        output_path=output_path
    )

# =============================================================================
# DEMO FUNCTION
# =============================================================================

def demo_simple_pdf():
    """Demo rápido de generación PDF"""
    
    print("🎨 Demo PDF Generator Simplificado")
    print("=" * 50)
    
    # Datos de ejemplo
    stakeholder_data = {
        'nombre_empresa': 'EdgeVerve AI Next',
        'objetivo_negocio': 'Establecer EdgeVerve como líder en IA empresarial',
        'audiencia_objetivo': 'CIOs de empresas Fortune 1000'
    }
    
    # Brief de ejemplo
    sample_brief = """
    **Business Objective**
    Establecer EdgeVerve AI Next como el proveedor líder de soluciones de IA Aplicada para empresas Fortune 1000, posicionando la plataforma como el estándar de la industria para transformación AI-first.

    **Marketing Objective**
    
    1. **Platform Brand Awareness**
    Crear conciencia entre CIOs y líderes de TI sobre las capacidades únicas de EdgeVerve AI Next, alcanzando 75% de reconocimiento entre empresas objetivo.

    2. **Lead Generation**
    Generar 500+ leads calificados de enterprises con ingresos $1B+ que estén evaluando soluciones de IA empresarial.

    3. **Thought Leadership**
    Posicionar EdgeVerve como autoridad en IA responsable y escalable a través de contenido educativo y casos de éxito documentados.

    **Target Audience**
    
    A. **Empresas con ingresos anuales entre $1B-$5B USD**
    Organizaciones establecidas con recursos para implementar transformaciones tecnológicas a gran escala y presupuestos significativos para IA empresarial.

    B. **Persona: CIO & CIO-1**
    Chief Information Officers y sus reportes directos que toman decisiones estratégicas sobre adopción de plataformas de IA a nivel empresarial.

    **The Problem we are trying to solve**
    Las empresas luchan por escalar IA más allá de la experimentación hacia implementaciones transformacionales que generen valor real de negocio.

    **Solutions/Offering**
    EdgeVerve AI Next: Plataforma unificada que democratiza la IA empresarial con capacidades PolyAI, deployment cloud-agnostic y gobernanza de IA responsable incorporada.
    """
    
    # Research data de ejemplo
    research_data = {
        'competitor_analysis': {
            'top_competitors': [
                {'name': 'Microsoft AI Platform'},
                {'name': 'Google Cloud AI'},
                {'name': 'AWS SageMaker'}
            ]
        },
        'market_trends': {
            'industry_trends': {
                'growth_rate': '+67% YoY'
            }
        },
        'audience_insights': {
            'channel_preferences': {
                'primary_channels': ['LinkedIn', 'Industry Events', 'Executive Briefings']
            }
        },
        'research_time_seconds': 4.2
    }
    
    # Generar PDF
    pdf_path = generate_pdf_from_brief(
        brief_content=sample_brief,
        stakeholder_inputs=stakeholder_data,
        research_data=research_data
    )
    
    if pdf_path:
        print(f"\n✅ Demo completado exitosamente!")
        print(f"📄 PDF generado: {pdf_path}")
        print(f"📁 Ubicación: {os.path.abspath(pdf_path)}")
        print("\n🎨 Características del PDF:")
        print("  • Branding EdgeVerve profesional")
        print("  • Colores azul marino/cian")
        print("  • Estructura jerárquica clara")
        print("  • Research insights integrados")
        print("  • Metadatos de generación AI")
    else:
        print("❌ Error generando PDF")

if __name__ == "__main__":
    demo_simple_pdf()
