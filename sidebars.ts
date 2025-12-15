import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  guideSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Part I: Infrastructure & Deployment',
      collapsible: true,
      collapsed: false,
      items: [
        'infrastructure-deployment/index',
        'infrastructure-deployment/ch01-deploy-your-app',
        'infrastructure-deployment/ch02-infrastructure-as-code',
        'infrastructure-deployment/ch03-orchestration',
      ],
    },
    {
      type: 'category',
      label: 'Part II: Code & CI/CD',
      collapsible: true,
      collapsed: false,
      items: [
        'code-cicd/index',
        'code-cicd/ch04-version-build-test',
        'code-cicd/ch05-continuous-deployment',
        'code-cicd/ch06-multiple-services',
      ],
    },
    {
      type: 'category',
      label: 'Part III: Operations & Architecture',
      collapsible: true,
      collapsed: false,
      items: [
        'operations-architecture/index',
        'operations-architecture/ch07-networking',
        'operations-architecture/ch08-security',
        'operations-architecture/ch09-storage',
        'operations-architecture/ch10-monitoring',
        'operations-architecture/ch11-future-of-devops',
      ],
    },
  ],
};

export default sidebars;
