import type { ProfileInput } from '~/content/schema'

/**
 * The single source of truth for the site, the printable résumé, the PDF, and the JSON APIs.
 *
 * This module is server-only: routes receive the validated profile through server functions,
 * so the raw data and its schema never ship in the client bundle.
 */
export const profileData: ProfileInput = {
  name: 'Kevin Groat',
  headline: 'Software architect & engineer',
  email: 'apps@kgroat.dev',
  url: 'https://www.kgroat.dev',
  source: 'https://github.com/kgroat/portfolio',
  summary: `
    I am a driven software architect and engineer. I believe in writing maintainable code and user-friendly experiences.
    I am familiar with everything JavaScript and TypeScript, and am constantly striving to better my trade through new projects and code katas.
    I aim to bring psychological safety to every team I am on, and feel open communication is key to having a high-performing team.
  `,
  principles: [
    'maintainable code',
    'user-friendly experiences',
    'psychological safety',
    'open communication',
  ],
  links: [
    { kind: 'github', label: 'GitHub', handle: 'kgroat', url: 'https://github.com/kgroat' },
    { kind: 'gitlab', label: 'GitLab', handle: 'kgroat', url: 'https://gitlab.com/kgroat' },
    {
      kind: 'linkedin',
      label: 'LinkedIn',
      handle: 'kevin-groat',
      url: 'https://www.linkedin.com/in/kevin-groat-62414b53/',
    },
    { kind: 'email', label: 'Email', handle: 'apps@kgroat.dev', url: 'mailto:apps@kgroat.dev' },
  ],
  experience: [
    {
      company: 'Brandi AI',
      start: '2025-11',
      roles: [
        {
          title: 'Staff Engineer',
          summary: `
            Expanding capabilities for Generative Engine Optimization sentiment extraction & measurement.
            Building and maintaining a shadcn/ui based design system.
            Building an in-app editor to allow for effortless content optimization and fast feedback.
          `,
          technologies: [
            'React',
            'TypeScript',
            'Next.js',
            'Playwright',
            'Storybook',
            'AI SDK',
            'TanStack Query',
            'Vercel',
            'GitHub',
          ],
        },
      ],
    },
    {
      company: 'Disqo',
      start: '2022-11',
      end: '2025-09',
      roles: [
        {
          title: 'Lead Frontend Engineer for the Customer Experience Platform',
          summary: `
            Working alongside Principal Engineers to build automated sampling into the CX platform in order to reduce the workload for customer support and survey programmers.
          `,
          technologies: [
            'Vue',
            'TypeScript',
            'Jest',
            'GitLab Duo',
            'Python',
            'Pandas',
            'DuckDB',
            'Argo Workflows',
          ],
        },
        {
          title: 'Lead Frontend Engineer for SurveyJunkie',
          summary: `
            Led the frontend team transitioning SurveyJunkie from an Angular and PHP monolithic codebase to a modular React codebase.
            Devised new architectural patterns for the React project that allow for more code reuse and maintainability.
            Introduced new technologies to the stack, including Cypress for end-to-end testing and SWR for interacting with REST APIs.
            Refactored large swaths of code to make them more maintainable and cleaner.
          `,
          technologies: [
            'React',
            'TypeScript',
            'Vitest',
            'GitLab Duo',
            'Cypress',
            'Storybook',
            'SWR',
            'Vite',
            'GitLab',
            'Figma',
          ],
        },
      ],
    },
    {
      company: 'Oracle Data Cloud / Oracle Advertising',
      start: '2018-11',
      end: '2022-11',
      roles: [
        {
          title: 'Senior Developer for custom App Gateway',
          summary: `
            Designed and implemented an App Gateway sitting in front of and managing multi-tenant applications.
            Created tooling to allow each tenant to have their own identity domain and segregated data.
          `,
          technologies: [
            'React',
            'TypeScript',
            'Java',
            'Spring Boot',
            'JUnit',
            'Kubernetes',
            'nginx',
            'Oracle Cloud Infrastructure',
            'Oracle IDCS',
            'GitLab',
          ],
        },
        {
          title: 'Senior Developer for BlueKai DMP (acquired)',
          summary: `
            Rebuilt the frontend of BlueKai from a Ruby on Rails thin client to a React and TypeScript project.
            Worked closely with designers to implement a re-usable React component framework, including a complex tree-structure component.
          `,
          technologies: [
            'React',
            'TypeScript',
            'Java',
            'Spring',
            'JUnit',
            'Kubernetes',
            'nginx',
            'GitLab',
            'Figma',
          ],
        },
      ],
    },
    {
      company: 'Excella Consulting',
      start: '2012-04',
      end: '2018-11',
      roles: [
        {
          title: 'Voice of America',
          summary: `
            Single-handedly built mobile applications in over 10 languages using a single codebase.
            Integrated a VPN tunnel for discreet access to news from areas where such information might be limited.
            Designed and integrated with a serverless GraphQL endpoint.
          `,
          technologies: [
            'React',
            'TypeScript',
            'Cordova',
            'Java',
            'Swift',
            'GraphQL',
            'Serverless',
            'AWS Lambda',
            'i18next',
          ],
        },
        {
          title: 'USCIS - myUSCIS application suite',
          summary: `
            Maintained two applications and led effort to bring React, Redux, and GraphQL into projects.
            Served as surrogate to UX team to help build a better user experience using React and more effective microinteractions.
          `,
          technologies: ['React', 'Redux', 'Ruby on Rails', 'GraphQL', 'Jenkins', 'GitHub'],
        },
        {
          title: 'USCIS - Civics Test Study Tools',
          summary: `
            Architected and developed a React Native application to allow immigrants to prepare for the US citizenship test.
            Created strong testing framework, pipeline, and build tools to ensure high quality code and easily publishable product.
          `,
          technologies: ['React Native', 'TypeScript', 'Redux', 'GitHub'],
        },
        {
          title: 'NRECA - Retirement, Payment & Distribution',
          summary: `
            Led a team of 4 developers to build an application to manage the payment and distributions of a $200M pension fund.
            Architected a .NET application backend and Backbone/AngularJS front end with more than 1 million lines of code.
          `,
          technologies: ['C#', 'ASP.NET', 'Angular', 'RequireJS', 'MS SQL'],
        },
        {
          title: 'NRECA - Online Projections',
          summary: `
            Built a web application to interface with Cobol mainframe in order to serve clients a projection of their eventual
            retirement or death benefits from a $200M pension fund.
          `,
          technologies: ['C#', 'ASP.NET'],
        },
      ],
    },
  ],
  projects: [
    {
      slug: 'sound-color-project',
      name: 'Sound Color Project',
      status: 'live',
      summary: `
        Featured at the Smithsonian's SoundScene2020, Sound Color Project explores the accessibility of sound through color,
        light, and texture, offering an opportunity to experience the sound spectrum visually.
        Though it began as a way to offer D/deaf or hard of hearing individuals an opportunity to visualize the feeling of music,
        the project has evolved into a system for exploring the ways that sound and color relate to each other.
      `,
      url: 'https://soundcolorproject.com/',
      repository: 'https://gitlab.com/soundcolorproject/soundcolorserver',
      technologies: [
        'React',
        'TypeScript',
        'WebGL',
        'Web Audio API',
        'Progressive Web App',
        'Heroku',
      ],
    },
    {
      slug: 'planning-poker',
      name: 'Planning Poker',
      status: 'live',
      summary: `
        A simple, intuitive way to collaborate on pointing stories during SCRUM backlog grooming or planning.
        Each member of the team gets to select their estimate, and the facilitator flips all of the cards at once to view all of the votes.
        Clear indicators show what users have chosen their estimates, and which members are still thinking.
      `,
      url: 'https://planning.kgroat.dev/',
      repository: 'https://gitlab.com/kgroat-planning-poker/showcase',
      technologies: [
        'Qwik',
        'TypeScript',
        'Supabase',
        'QwikCity',
        'PostgreSQL',
        'Vite',
        'Google Cloud Run',
      ],
    },
    {
      slug: 'quote-explorer',
      name: 'Quote Explorer',
      status: 'live',
      summary: `
        A fun little app which lets you submit and explore quotes from famous people throughout history.
        Built with Next.js, Prisma, and Next Auth, this project showcases some best practices surrounding using server-side rendering and server actions.
      `,
      url: 'https://quotes.kgroat.dev/',
      repository: 'https://gitlab.com/kgroat/quote-explorer',
      technologies: [
        'React',
        'TypeScript',
        'Next.js',
        'React Query',
        'Prisma',
        'PostgreSQL',
        'Vercel',
      ],
    },
    {
      slug: 'ai-game-master',
      name: 'AI Game Master',
      status: 'in-progress',
      summary: `
        An AI RPG game master, built with the Vercel AI SDK to support multiple AI backends, including Mistral and Gemini.
        It allows for a large range of scenarios, even allowing custom stats available to the player.
        Still very much a work in progress, but getting closer to a playable version every day.
      `,
      technologies: [
        'React',
        'TypeScript',
        'Next.js',
        'React Query',
        'Vercel AI SDK',
        'Mistral Large',
        'Google Gemini',
        'Supermaven',
      ],
    },
  ],
  skills: [
    {
      slug: 'typescript',
      name: 'TypeScript',
      icon: 'typescript',
      category: 'languages',
      summary: `
        TypeScript has been in my toolbelt since early in its lifespan, back in 2015.
        I originally used it with Angular, but I have come to love it so much that I use it in every project I start.
        In my opinion, TypeScript is a necessity for writing maintainable code, especially when working in a larger team or with cross-functional teams.
      `,
    },
    {
      slug: 'react',
      name: 'React',
      icon: 'react',
      category: 'languages',
      summary: `
        I have been using React in almost all of my projects since 2017.
        Throughout the years, I have developed a deep understanding of the inner workings of the framework,
        as well as how to utilize functional paradigms and React hooks.
      `,
    },
    {
      slug: 'nodejs',
      name: 'NodeJS',
      icon: 'nodejs',
      category: 'languages',
      summary: `
        NodeJS is easily my favorite language for writing servers and CLI utilities.
        It encompasses everything I love about the JS/TS ecosystem, and allows it to run natively outside of a browser.
        A key tool in my repertoire that allows me to iterate quickly, and a key component to understanding things like Next.js.
      `,
    },
    {
      slug: 'webpack',
      name: 'Webpack',
      icon: 'webpack',
      category: 'build-test',
      summary: `
        I'm very knowledgeable on how to configure Webpack, in part because I've used webpack for most React projects I've been involved with, until recently.
        Being the most battle-tested of all of the bundlers, I love that it's very powerful and configurable.
        That said, I'd reach to others for new projects.
      `,
    },
    {
      slug: 'vite',
      name: 'Vite',
      icon: 'vite',
      category: 'build-test',
      summary: `
        I have used vite in a couple of projects and it has proven blazingly fast and incredibly easy to configure, especially compared to Webpack.
        If given the choice between the two, on any greenfield project, I would choose vite almost every time.
      `,
    },
    {
      slug: 'nextjs',
      name: 'Next.js',
      icon: 'nextjs',
      category: 'languages',
      summary: `
        I only have about 1 year of experience with Next.js and its app router, but I've found server components to be a powerful tool for building React applications.
        In addition, the use of server actions makes the reusability of server-side code a breeze and largely makes things like REST endpoints unnecessary, especially in combination with a tool like tRPC.
      `,
    },
    {
      slug: 'tanstack-start',
      name: 'TanStack Start',
      icon: 'tanstack',
      category: 'languages',
      summary: `
        I'm constantly striving to learn new things, and TanStack Start is one of the latest tools I'm adding to my tool-belt.
        I've always been impressed by every project in the TanStack suite that I've ever interacted with, and TanStack Start is no exception.
      `,
    },
    {
      slug: 'graphql',
      name: 'GraphQL',
      icon: 'graphql',
      category: 'languages',
      summary: `
        I have experience developing both GraphQL backends in node and Java as well as frontends with React.
        It's a great tool for being able to fetch exactly the data you need to avoid over or under fetching.
        Even so, unless it's the right tool for the job, I've found that it is overkill for most scenarios.
      `,
    },
    {
      slug: 'trpc',
      name: 'tRPC',
      icon: 'trpc',
      category: 'languages',
      summary: `
        I have used tRPC in a few personal projects, and have enjoyed the experience greatly.
        While REST and GraphQL are great options, I believe that tRPC is the best solution for codebases where the frontend and backend live in the same repo, such as Next.js projects.
      `,
    },
    {
      slug: 'react-query',
      name: 'React Query',
      icon: 'reactquery',
      category: 'languages',
      summary: `
        React Query is my go-to solution for asynchronous state management in React.
        I've used it in enterprise-scale applications as well as small ones, and it's great in either.
        I don't start new React projects without it.
      `,
    },
    {
      slug: 'jest',
      name: 'Jest',
      icon: 'jest',
      category: 'build-test',
      summary: `
        I have used Jest in most applications that I've ever worked on, starting back in 2018.
        Because of this, it's the test runner I am most familiar with.
        I'm aware of the 'in's and 'out's of not only configuring it but also its quirks.
      `,
    },
    {
      slug: 'vitest',
      name: 'Vitest',
      icon: 'vitest',
      category: 'build-test',
      summary: `
        I've used vitest in a production codebase only once, and it's lightning fast.
        It also is easy to configure, allows you to share large parts of your configuration with vite.
      `,
    },
    {
      slug: 'cypress',
      name: 'Cypress',
      icon: 'cypress',
      category: 'build-test',
      summary: `
        I have had a great experience using Cypress for end-to-end and component testing.
        It has an unparalleled developer experience for such tasks, and has a top-notch cloud offering for viewing and debugging test runs.
      `,
    },
    {
      slug: 'vscode',
      name: 'VSCode',
      icon: 'vscode',
      category: 'tools',
      summary: `
        Visual Studio Code is my editor of choice, not only because of its incredible support for JavaScript, but also its plethora of extensions.
        I find working in VSCode a breeze and love its brawn and quirks alike.
      `,
    },
    {
      slug: 'react-native',
      name: 'React Native',
      icon: 'react',
      category: 'languages',
      summary: `
        I have a small amount of experience with creating truly native applications, and realized early on that I don't enjoy it.
        That's why I'm thrilled with how easy React Native (especially with Expo) makes it to create beautiful, feature-rich, and fast applications using the technologies I'm most comfortable with.
      `,
    },
    {
      slug: 'docker',
      name: 'Docker',
      icon: 'docker',
      category: 'platform',
      summary: `
        If docker has taught me anything, it's that being able to replicate the exact behavior that an application will have in production in every
        environment - even local development - is key to debugging and creating maintainable solutions. Most applications I work on I choose to use docker
        in one way or another because it is so vital for cross-environment consistency.
      `,
    },
    {
      slug: 'kubernetes',
      name: 'Kubernetes (k8s)',
      icon: 'kubernetes',
      category: 'platform',
      summary: `
        I've used k8s to deploy large-scale groups of microservices and orchestrations while at Oracle.
        I managed several services deployed to it, including spinning some up from scratch.
      `,
    },
    {
      slug: 'vercel',
      name: 'Vercel',
      icon: 'vercel',
      category: 'platform',
      summary: `
        I've used vercel to deploy a few personal apps, including this portfolio.
        I like that using it is a breeze, and its tooling enables easy deployment, branch environments, and reviews.
      `,
    },
    {
      slug: 'flyio',
      name: 'Fly.io',
      icon: 'flyio',
      category: 'platform',
      summary: `
        I have limited experience with Fly.io, but have enjoyed the experience greatly.
        It's as easy to use as Vercel, but runs any docker image (though using lightweight VMs rather than containers).
        Because of this, it's very versatile, and I've even used it to deploy Gleam apps.
      `,
    },
    {
      slug: 'gitlab-ci',
      name: 'GitLab CI',
      icon: 'gitlab',
      category: 'platform',
      summary: `
        I have used several CI/CD technologies throughout the years, but GitLab CI is the one I have become the most comfortable with.
        Its yaml syntax and the fact that its configuration is checked into the codebase make it very user-friendly and easy to debug.
        The fact that it's capable of running any docker image makes it incredibly flexible as a CI platform.
      `,
    },
    {
      slug: 'github',
      name: 'GitHub',
      icon: 'github',
      category: 'platform',
      summary: `
        I'm coming back around to using GitHub again.
        I took some time away from it because I was all-in on GitLab. This was in part because it's open source and in part because I was using it at work.
        That said, I've realized that GitHub has all of the features of GitLab now, especially since GitHub Actions are able to harness the power of open source workflows.
      `,
    },
    {
      slug: 'gleam',
      name: 'Gleam',
      icon: 'gleam',
      category: 'languages',
      summary: `
        I've created a couple of small apps using Gleam, and love the language. It still feels a little young, but the community is amazing.
        It's a typesafe, functional language that compiles down for either the Erlang BEAM VM or JavaScript.
        Running on BEAM means it is powerful enough to handle highly concurrent workloads with ease, and running on JS means it is portable enough to run on any browser.
      `,
    },
    {
      slug: 't3-code',
      name: 'T3 Code',
      icon: 't3code',
      category: 'ai',
      summary: `
        My agentic tool of choice when building software. I've found it to be incredibly useful and powerful,
        especially when trying to orchestrate agents between harnesses (Codex, Claude Code, Antigravity, Muse Wonder, etc.)
      `,
    },
    {
      slug: 'openai-codex',
      name: 'OpenAI Codex',
      icon: 'codex',
      category: 'ai',
      summary: `
        As the first tool I started with when learning agentic coding, Codex will always have a special place in my heart.
        I logged an incredible amount of time in Codex when it was my daily driver.
      `,
    },
    {
      slug: 'claude-code',
      name: 'Claude Code',
      icon: 'claudecode',
      category: 'ai',
      summary: `
        Claude Code, being one of the industry-leading harnesses, is incredibly useful.
        I have extensive experience using it to prompt, code, and everything in between.
      `,
    },
    {
      slug: 'shell',
      name: 'bash / zsh / fish',
      icon: 'bash',
      category: 'tools',
      summary: `
        I am very comfortable in the terminal, and know many tools to help with scripting and debugging.
        I've written many shell scripts, ranging from data retrieval and manipulation using curl, jq, and sed to setting up whole workspaces with a single script.
      `,
    },
    {
      slug: 'nixos',
      name: 'NixOS',
      icon: 'nixos',
      category: 'platform',
      summary: `
        I've started daily driving and deploying servers with NixOS.
        I love that it makes repeatable setup of machines quick and easy without tools like Ansible, and there are now tools built around NixOS to make deployment a breeze, too.
      `,
    },
    {
      slug: 'godot',
      name: 'Godot',
      icon: 'godot',
      category: 'tools',
      summary: `
        I'm learning game development in Godot.
        My learning journey is only just beginning, but I like how easy it is to pick up, and love the fact that it's 100% open source.
      `,
    },
  ],
}
