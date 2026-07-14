import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
}

interface Project {
  name: string;
  year: string;
  summary: string;
  stack: string[];
  endpoints: Endpoint[];
  mockup: 'hotel' | 'auth';
}

interface SkillGroup {
  label: string;
  items: string[];
}

interface Stat {
  value: string;
  label: string;
  numericTarget?: number;
}

interface TerminalLine {
  type: 'input' | 'output';
  text: string;
}

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit, OnDestroy {
  @ViewChild('root', { static: true }) rootRef!: ElementRef<HTMLElement>;
  @ViewChild('terminalBody') terminalBodyRef?: ElementRef<HTMLElement>;
  @ViewChild('terminalInputEl') terminalInputRef?: ElementRef<HTMLInputElement>;
  private revealObserver?: IntersectionObserver;
  private countObserver?: IntersectionObserver;

  protected terminalInput = '';
  protected readonly terminalLines: TerminalLine[] = [
    { type: 'output', text: "Welcome. Type 'help' to see what this does." },
  ];

  private readonly commands: Record<string, () => string> = {
    help: () =>
      'Available: about, skills, projects, contact, whoami, resume, clear',
    about: () =>
      "Fresher full stack dev. Comfortable with C# + ASP.NET Core, still leveling up my Angular. Based in Hyderabad.",
    skills: () =>
      'Backend: ASP.NET Core, EF Core, ADO.NET, SQL Server\nFrontend: Angular, TypeScript, HTML/CSS\nAlso: Git, REST APIs, JWT auth',
    projects: () =>
      '1. Hotel Registration & Room Management System (ASP.NET Core + EF Core)\n2. Secure User Authentication System (C# + ADO.NET)\nScroll down to see both in full.',
    contact: () => 'Email: rohithkumarjangam@gmail.com\nPhone: +91 63017 06936',
    whoami: () =>
      '{\n  "name": "Jangam Rohith Kumar",\n  "role": "Fresher — Full Stack .NET + Angular",\n  "location": "Hyderabad, IN",\n  "status": "open_to_work"\n}',
    resume: () => "Downloading... (see the 'Download résumé' button above)",
  };

  protected readonly stats: Stat[] = [
    { value: '2', label: 'Projects built', numericTarget: 2 },
    { value: '6', label: 'Months of full stack training', numericTarget: 6 },
    { value: 'C#/.NET', label: 'Primary stack' },
    { value: 'Angular', label: 'Currently learning' },
  ];

  protected readonly skillGroups: SkillGroup[] = [
    { label: 'Languages', items: ['C#', 'TypeScript', 'JavaScript (ES6+)', 'SQL', 'Java'] },
    { label: 'Backend', items: ['ASP.NET Core', 'ASP.NET MVC', 'Web API', 'Entity Framework Core', 'ADO.NET'] },
    { label: 'Frontend', items: ['Angular', 'HTML5', 'CSS3', 'Responsive Design'] },
    { label: 'Data', items: ['SQL Server', 'MySQL', 'Stored Procedures', 'Schema Design'] },
    { label: 'API & Security', items: ['REST API Design', 'JWT Auth', 'Postman'] },
    { label: 'Tooling', items: ['Visual Studio 2022', 'VS Code', 'Git', 'GitHub', 'Agile/Scrum'] },
  ];

  protected readonly projects: Project[] = [
    {
      name: 'Hotel Registration & Room Management System',
      year: '2026',
      summary:
        'A full stack practice project for handling guest registration and room availability. Built with ASP.NET Core Web API and EF Core on SQL Server, with basic endpoints for reservations and room assignment.',
      stack: ['ASP.NET Core', 'C#', 'Entity Framework Core', 'SQL Server', 'REST APIs'],
      endpoints: [
        { method: 'GET', path: '/api/rooms' },
        { method: 'POST', path: '/api/reservations' },
        { method: 'PUT', path: '/api/rooms/{id}/status' },
      ],
      mockup: 'hotel',
    },
    {
      name: 'Secure User Authentication System',
      year: '2025',
      summary:
        'A Windows Forms desktop app for account registration and login, using ADO.NET for storage, with password hashing and basic input validation. Built to practice core C# and database fundamentals.',
      stack: ['C#', 'Windows Forms', 'SQL Server', 'ADO.NET', 'OOP'],
      endpoints: [
        { method: 'POST', path: '/auth/register' },
        { method: 'POST', path: '/auth/login' },
        { method: 'GET', path: '/users/{id}' },
      ],
      mockup: 'auth',
    },
  ];

  ngAfterViewInit() {
    const root = this.rootRef.nativeElement;

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.revealObserver?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    root.querySelectorAll('.reveal').forEach((el) => this.revealObserver!.observe(el));

    this.countObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.animateCount(entry.target as HTMLElement);
            this.countObserver?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.5 }
    );
    root.querySelectorAll('[data-count-target]').forEach((el) => this.countObserver!.observe(el));
  }

  private animateCount(el: HTMLElement) {
    const target = Number(el.dataset['countTarget']);
    if (!target || Number.isNaN(target)) return;
    const duration = 900;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  protected loading = false;

  runCommand() {
    const raw = this.terminalInput.trim();
    if (!raw) return;
    this.terminalLines.push({ type: 'input', text: raw });
    this.terminalInput = '';

    const key = raw.toLowerCase();
    if (key === 'clear') {
      this.terminalLines.length = 0;
      return;
    }

    this.loading = true;
    this.scrollTerminalToBottom();

    setTimeout(() => {
      if (this.commands[key]) {
        this.terminalLines.push({ type: 'output', text: this.commands[key]() });
      } else {
        this.terminalLines.push({
          type: 'output',
          text: `command not found: ${raw}. Type 'help' to see what's available.`,
        });
      }
      this.loading = false;
      this.scrollTerminalToBottom();
    }, 450 + Math.random() * 300);
  }

  private scrollTerminalToBottom() {
    setTimeout(() => {
      const body = this.terminalBodyRef?.nativeElement;
      if (body) body.scrollTop = body.scrollHeight;
    });
  }

  focusTerminal() {
    this.terminalInputRef?.nativeElement.focus();
  }

  onMagneticMove(event: MouseEvent, el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const relX = event.clientX - rect.left - rect.width / 2;
    const relY = event.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${relX * 0.25}px, ${relY * 0.4}px)`;
  }

  onMagneticLeave(el: HTMLElement) {
    el.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
    el.style.transform = 'translate(0, 0)';
    setTimeout(() => (el.style.transition = ''), 350);
  }

  ngOnDestroy() {
    this.revealObserver?.disconnect();
    this.countObserver?.disconnect();
  }
}