// Mock implementation of base44 client with Helper Generators

const generateDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Project Templates
const IT_PROJECTS = [
    "Cloud Migration Phase 2", "AI Customer Support Agent", "Legacy ERP Upgrade", "Cybersecurity Audit 2025",
    "Mobile App Refactor", "Data Lake Implementation", "Microservices Decoupling", "Internal DevPortal",
    "Blockchain POC", "Zero Trust Network Rollout"
];

const CONST_PROJECTS = [
    "HQ Office Renovation", "Warehouse B Expansion", "Solar Panel Installation", "Smart HVAC Upgrade",
    "Employee Gym Construction", "Data Center Bunker", "Parking Lot Resurfacing", "Lobby Modernization",
    "Fire Suppression System", "Green Roof Initiative"
];

const STATUSES = ['Planning', 'In Progress', 'In Progress', 'In Progress', 'Completed', 'On Hold'];
const HEALTH_STATUSES = ['Healthy', 'Healthy', 'Healthy', 'At Risk', 'Critical'];
const REGIONS = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Bali', 'Singapore', 'Remote'];

// Generate Data
const generateMockData = () => {
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    // 1. Implementations (Projects)
    const implementations = [];
    const allProjects = [...IT_PROJECTS, ...CONST_PROJECTS];

    allProjects.forEach((name, i) => {
        const createdDate = generateDate(oneYearAgo, today);
        const projectType = IT_PROJECTS.includes(name) ? 'IT' : 'Construction';
        const budgetBase = projectType === 'IT' ? 500000000 : 2000000000; // IT ~500M, Const ~2B
        const budgetAllocated = getRandomInt(budgetBase, budgetBase * 5);
        // Spent is random portion of allocated
        const budgetSpent = Math.floor(budgetAllocated * (Math.random() * 0.9));

        implementations.push({
            id: `impl_${i + 1}`,
            name: name,
            type: projectType,
            status: pickRandom(STATUSES),
            health_status: pickRandom(HEALTH_STATUSES),
            budget_allocated: budgetAllocated,
            budget_spent: budgetSpent,
            created_date: formatDate(createdDate),
            customer_region: pickRandom(REGIONS),
            completion_percentage: getRandomInt(10, 100)
        });
    });

    // 2. Tasks
    const tasks = [];
    implementations.forEach(impl => {
        const taskCount = getRandomInt(3, 8);
        for (let j = 0; j < taskCount; j++) {
            tasks.push({
                id: `t_${impl.id}_${j}`,
                title: `${impl.name} - Phase ${j + 1}`,
                status: pickRandom(['To Do', 'In Progress', 'Done', 'Review']),
                assigned_to: pickRandom(['Alex Rivera', 'Sarah Chen', 'Budi Santoso', 'Siti Rahma', 'John Smith']),
                project_id: impl.id,
                created_date: impl.created_date,
                due_date: formatDate(generateDate(new Date(impl.created_date), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)))
            });
        }
    });

    // 3. Risks
    const risks = [];
    implementations.forEach(impl => {
        if (Math.random() > 0.6) { // 40% chance of risk
            risks.push({
                id: `r_${impl.id}`,
                title: `Risk for ${impl.name}`,
                description: "Potential delay due to supply chain/resource shortage",
                status: pickRandom(['Open', 'Mitigated', 'Closed']),
                severity: pickRandom(['Low', 'Medium', 'High', 'Critical']),
                project_id: impl.id,
                created_date: impl.created_date
            });
        }
    });

    // 4. Activity Log (Recent)
    const activities = [];
    for (let i = 0; i < 50; i++) {
        activities.push({
            id: `act_${i}`,
            description: pickRandom(['Updated status', 'Completed task', 'Added comment', 'Uploaded document', 'Changed risk level']),
            user: pickRandom(['Alex Rivera', 'Sarah Chen', 'Admin']),
            project: pickRandom(allProjects),
            time: `${getRandomInt(1, 24)}h ago`
        });
    }

    // 5. Resources with Skills & Departments
    const resources = [
        {
            id: 'res1', name: 'Ahmad Rizki', role: 'Project Manager', department: 'PMO',
            type: 'Human', capacity: 160, load: 152, status: 'Busy',
            skills: ['Project Management', 'Stakeholder Management', 'Agile', 'Risk Analysis'],
            email: 'ahmad.rizki@trilogic.corp'
        },
        {
            id: 'res2', name: 'Budi Santoso', role: 'Project Manager', department: 'PMO',
            type: 'Human', capacity: 160, load: 168, status: 'Overloaded',
            skills: ['Project Management', 'Technical Architecture', 'Vendor Management'],
            email: 'budi.santoso@trilogic.corp'
        },
        {
            id: 'res3', name: 'Dewi Lestari', role: 'Technical Lead', department: 'IT',
            type: 'Human', capacity: 160, load: 112, status: 'Available',
            skills: ['System Architecture', 'Cloud Computing', 'Data Migration', 'React', 'Node.js'],
            email: 'dewi.lestari@trilogic.corp'
        },
        {
            id: 'res4', name: 'Eko Prasetyo', role: 'Engineer', department: 'Engineering',
            type: 'Human', capacity: 160, load: 136, status: 'Busy',
            skills: ['Smart Grid', 'IoT', 'Network Engineering', 'SCADA'],
            email: 'eko.prasetyo@trilogic.corp'
        },
        {
            id: 'res5', name: 'Fitri Handayani', role: 'QA Specialist', department: 'Quality',
            type: 'Human', capacity: 160, load: 64, status: 'Available',
            skills: ['Quality Assurance', 'Test Automation', 'Selenium', 'Performance Testing'],
            email: 'fitri.h@trilogic.corp'
        },
        {
            id: 'res6', name: 'Server Cluster A', role: 'Compute Node', department: 'Infrastructure',
            type: 'Digital', capacity: 100, load: 85, status: 'Active',
            skills: ['Data Processing', 'Storage', 'Load Balancing'],
            email: 'admin@infra.trilogic.corp'
        },
        {
            id: 'res7', name: 'Heavy Excavator 01', role: 'Heavy Equipment', department: 'Construction',
            type: 'Machine', capacity: 100, load: 0, status: 'Maintenance',
            skills: ['Excavation', 'Heavy Lifting'],
            email: 'maint@const.trilogic.corp'
        },
    ];

    // 6. Automation Rules
    const automationRules = [
        {
            id: 'ar1', name: 'Auto-create tasks on status change to In Progress',
            description: 'Automatically create standard project tasks when implementation moves to In Progress',
            active: true,
            trigger: 'Status Change',
            priority: 'High',
            tags: ['Status Change', 'High'],
            executions: 3,
            actions: 3,
            last_run: 'about 7 hours ago'
        },
        {
            id: 'ar2', name: 'Escalate overdue critical tasks',
            description: 'Send escalation notification when high/critical priority tasks are overdue',
            active: true,
            trigger: 'Task Overdue',
            priority: 'Critical',
            tags: ['Task Overdue', 'Critical'],
            executions: 19,
            actions: 2,
            last_run: 'Jan 8, 13:31'
        },
        {
            id: 'ar3', name: 'Alert on budget threshold 80%',
            description: 'Notify PM when project budget reaches 80% utilization',
            active: true,
            trigger: 'Budget Threshold',
            priority: 'High',
            tags: ['Budget Threshold', 'High'],
            executions: 12,
            actions: 2,
            last_run: 'Jan 8, 13:32'
        },
        {
            id: 'ar4', name: 'Archive Completed Projects',
            description: 'Moves project to cold storage after 30 days of completion',
            active: false,
            trigger: 'Status = Completed',
            priority: 'Low',
            tags: ['Cleanup', 'Low'],
            executions: 5,
            actions: 1,
            last_run: 'Dec 20, 2025'
        },
        {
            id: 'ar5', name: 'Auto-assign Reviewers',
            description: 'Assigns QA based on workload when task moves to Review',
            active: true,
            trigger: 'Status Change',
            priority: 'Medium',
            tags: ['Assignment', 'Medium'],
            executions: 45,
            actions: 1,
            last_run: '2 hours ago'
        },
        {
            id: 'ar6', name: 'Project Health Check',
            description: 'Runs weekly analysis on project metrics',
            active: true,
            trigger: 'Schedule',
            priority: 'Medium',
            tags: ['Reporting', 'Medium'],
            executions: 12,
            actions: 0,
            last_run: 'Yesterday'
        }
    ];

    // 7. Notifications
    const notifications = [
        {
            id: 'n1',
            title: 'Resource Overallocated',
            message: '2 resource(s) overallocated',
            severity: 'warning',
            time: 'about 7 hours ago',
            read: false
        },
        {
            id: 'n2',
            title: 'Critical Risk Alert',
            message: '2 critical risk(s) need escalation',
            severity: 'critical',
            time: 'about 7 hours ago',
            read: false
        },
        {
            id: 'n3',
            title: 'ESCALATION: Escalate critical risks',
            message: 'Critical risk detected requiring management attention',
            severity: 'critical',
            time: 'about 7 hours ago',
            read: false
        },
        {
            id: 'n4',
            title: 'Budget Threshold Reached',
            message: 'Project "Alpha" has exceeded 80% budget',
            severity: 'warning',
            time: 'Yesterday',
            read: true
        }
    ];


    return { implementations, tasks, risks, activities, resources, automationRules, notifications };
};

// Singleton data store
const MOCK_DB = generateMockData();

export const base44 = {
    auth: {
        me: async () => ({
            id: 'usr_123',
            full_name: 'Alex Rivera',
            email: 'alex.rivera@trilogic.corp',
            role: 'Project Manager',
            avatar_url: null
        }),
        logout: async () => {
            console.log('Logging out...');
            window.location.reload();
        }
    },
    entities: {
        Implementation: {
            list: async () => MOCK_DB.implementations
        },
        Task: {
            list: async () => MOCK_DB.tasks
        },
        Risk: {
            list: async () => MOCK_DB.risks
        },
        ActivityLog: {
            list: async () => MOCK_DB.activities
        },
        AutomationRule: {
            list: async () => MOCK_DB.automationRules
        },
        Notification: {
            list: async () => MOCK_DB.notifications
        },
        ResourceAllocation: {
            list: async () => []
        },
        Resource: {
            list: async () => MOCK_DB.resources
        }
    }
};
