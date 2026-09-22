import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Job, Startup } from '../types';

export type JobDetailParams = { job: Job };
export type StartupDetailParams = { startup: Startup };

export type HomeStackParamList = {
  Feed:
    | {
        mode?: 'startups' | 'jobs' | 'freelance';
        startupFilters?: import('../types').StartupFilters;
        jobFilters?: import('../types').JobFilters;
      }
    | undefined;
  StartupsFilter: { filters: import('../types').StartupFilters };
  JobsFilter: { filters: import('../types').JobFilters; mode?: 'jobs' | 'freelance' };
  JobDetail: JobDetailParams;
  StartupDetail: StartupDetailParams;
};

export type AppliedStackParamList = {
  AppliedList: undefined;
  JobDetail: JobDetailParams;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Applied: undefined;
  Profile: undefined;
};

export type EmployerTabParamList = {
  EmployerJobs: undefined;
  EmployerApplicants: undefined;
  EmployerBilling: undefined;
  EmployerCompany: undefined;
};

export type AdminTabParamList = {
  AdminHome: undefined;
  AdminPeople: undefined;
  AdminJobs: undefined;
  AdminProfile: undefined;
};
