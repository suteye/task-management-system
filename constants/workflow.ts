import { UserRole } from '@/types';

export interface WorkflowStep {
  step_no: number;
  step_name: string;
  who_create: UserRole[];
  who_approve: UserRole[];
  who_complete: UserRole[];
  output: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step_no: 0,
    step_name: 'Create BCD',
    who_create: ['tl'],
    who_approve: [],
    who_complete: ['tl'],
    output: 'BCD'
  },
  {
    step_no: 1,
    step_name: 'Dips CO --> Code & Doc',
    who_create: ['dev'],
    who_approve: ['section'],
    who_complete: ['dev'],
    output: 'Change control fork code'
  },
  {
    step_no: 3,
    step_name: '[TFs] Fork code',
    who_create: ['tl'], // Assuming Change control is handled by TL
    who_approve: [],
    who_complete: ['tl'],
    output: 'Working repo'
  },
  {
    step_no: 4,
    step_name: '[TFs] Create branch and assign',
    who_create: ['tl'],
    who_approve: [],
    who_complete: ['tl'],
    output: 'Develop branch'
  },
  {
    step_no: 5,
    step_name: 'Test sc',
    who_create: ['tl', 'dev'],
    who_approve: [],
    who_complete: ['tester'],
    output: 'Test sc, Testcase'
  },
  {
    step_no: 6,
    step_name: 'Confirm BCD',
    who_create: ['tl'],
    who_approve: ['user'],
    who_complete: ['tl'],
    output: 'Mail confirm'
  },
  {
    step_no: 7,
    step_name: 'Confirm Testcase',
    who_create: ['tl', 'tester'],
    who_approve: ['user'],
    who_complete: ['tl', 'tester'],
    output: 'Mail confirm'
  },
  {
    step_no: 8,
    step_name: 'Approve BCD',
    who_create: ['tl'],
    who_approve: ['section'],
    who_complete: ['dept_head'],
    output: 'Mail Approve'
  },
  {
    step_no: 9,
    step_name: 'Assign task',
    who_create: ['tl'],
    who_approve: ['section'],
    who_complete: ['tl'],
    output: 'Task in dips'
  },
  {
    step_no: 10,
    step_name: 'SIT in Dev',
    who_create: ['dev'],
    who_approve: ['tl'],
    who_complete: ['dev'],
    output: 'File SIT'
  },
  {
    step_no: 11,
    step_name: 'Appoint SIT',
    who_create: ['tl', 'dev'],
    who_approve: [],
    who_complete: ['tester'],
    output: 'Mail finish'
  },
  {
    step_no: 12,
    step_name: 'SAS SIT, UAT',
    who_create: ['dev'],
    who_approve: ['section'],
    who_complete: ['dev'],
    output: 'Section approval after 2 PM'
  },
  {
    step_no: 13,
    step_name: 'Review code in SAS',
    who_create: ['dev'],
    who_approve: ['tl'],
    who_complete: ['section', 'dept_head'],
    output: 'Code in master'
  },
  {
    step_no: 14,
    step_name: '[TFs] Pull Request to master code Before UAT',
    who_create: ['dev'],
    who_approve: ['tl'],
    who_complete: ['section', 'dept_head'],
    output: 'Code ready for UAT'
  },
  {
    step_no: 15,
    step_name: 'Appoint UAT',
    who_create: ['tl', 'dev'],
    who_approve: [],
    who_complete: ['tester'],
    output: 'Mail finish, Mail Go-live'
  },
  {
    step_no: 16,
    step_name: '[TFs] Pull Request to master Document Finish UAT',
    who_create: ['dev'],
    who_approve: ['tl'],
    who_complete: ['section', 'dept_head'],
    output: 'Document in master'
  },
  {
    step_no: 17,
    step_name: '[TFs] Pull Request to CI Code & Doc Finish UAT',
    who_create: ['tl'],
    who_approve: ['section', 'dept_head'],
    who_complete: ['tl'], // Assuming Change control is handled by TL
    output: 'Code & Doc in CI'
  },
  {
    step_no: 18,
    step_name: 'Dips CI --> Code & Doc',
    who_create: ['dev'],
    who_approve: ['section'],
    who_complete: ['dept_head'],
    output: 'Deployed to CI'
  },
  {
    step_no: 19,
    step_name: 'Dips SAS',
    who_create: ['tl'],
    who_approve: ['section'],
    who_complete: ['dept_head'],
    output: 'Deployed to SAS'
  }
];