import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

interface Project {
  name: string;
  year: string;
  summary: string;
  stack: string[];
  link?: string;
  internal?: boolean;
  mockup: 'hotel' | 'auth';
}

interface SkillGroup {
  label: string;
  items: string[];
}

interface Stat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit, OnDestroy {
  @ViewChild('root', { static: true }) rootRef!: ElementRef<HTMLElement>;
  private observer?: IntersectionObserver;

  protected readonly stats: Stat[] = [
    { value: '2', label: 'Projects built' },
    { value: '6', label: 'Months of full stack training' },
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
      mockup: 'hotel',
    },
    {
      name: 'Secure User Authentication System',
      year: '2025',
      summary:
        'A Windows Forms desktop app for account registration and login, using ADO.NET for storage, with password hashing and basic input validation. Built to practice core C# and database fundamentals.',
      stack: ['C#', 'Windows Forms', 'SQL Server', 'ADO.NET', 'OOP'],
      mockup: 'auth',
    },
  ];

  ngAfterViewInit() {
    const targets = this.rootRef.nativeElement.querySelectorAll('.reveal');
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    targets.forEach((el) => this.observer!.observe(el));
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}