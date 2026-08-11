import type { UserRole } from '@/types/auth';

export type LegalWebViewParams = { title: string; uri: string };

export type AuthStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  SignIn: undefined;
  SignUp: undefined;
  EmailVerify: { email: string; roleForSignup: UserRole };
  ForgotPassword: undefined;
  OTPVerification: { email: string };
  ResetSuccess: undefined;
  /** `resetToken` comes from POST /auth/verify_Password_token after OTP; required to call /auth/reset-password */
  SetNewPassword: { email: string; resetToken?: string };
  TaskerCategorySelect: undefined;
  TaskerSubCategorySelect: { categoryId: string };
  TaskerSkillsAndRate: undefined;
  TaskerCertificates: undefined;
  LegalWebView: LegalWebViewParams;
};

export type CustomerTabParamList = {
  CustomerHome: undefined;
  CustomerNotifications: undefined;
  CustomerFindPro: undefined;
  CustomerProviderDetails: { providerId: string | number };
  CustomerCreateTask: undefined;
  CustomerBidding: undefined;
  CustomerBookings: undefined;
  CustomerAllServices: undefined;
  CustomerPopularServices: undefined;
  CustomerSubCategories: { categoryId: string; categoryName: string };
  CustomerServiceDetails: { subCategoryId: string; subCategoryName: string };
  CustomerProfile: undefined;
  CustomerMyProfile: undefined;
  CustomerOrderHistory: undefined;
  CustomerReviews: undefined;
  CustomerSupport: undefined;
  CustomerReferral: undefined;
  CustomerWallet: undefined;
  CustomerAddCards: { invoiceId?: number } | undefined;
  CustomerMatching: {
    taskId?: string | number;
    title?: string;
    description?: string;
    categoryName?: string;
    workingHours?: string;
    budget?: number;
    amountType?: string;
  } | undefined;
  CustomerPendingTask: {
    taskId?: string | number;
    title?: string;
    description?: string;
    categoryName?: string;
    workingHours?: string;
    budget?: number;
    amountType?: string;
  } | undefined;
  CustomerHireProfessional: { providerId: string | number };
  CustomerTaskDetail: { taskId: string | number };
  CustomerBookingDetail: { taskId: string | number };
  CustomerChat: { taskId: string | number; receiverId: number; title?: string };
};

export type CustomerRootParamList = {
  CustomerTabs: undefined;
  LegalWebView: LegalWebViewParams;
};

export type TaskerTabParamList = {
  TaskerHome: undefined;
  TaskerFindJobs: undefined;
  TaskerBidding: undefined;
  TaskerHistory: undefined;
};

export type TaskerStackParamList = {
  TaskerTabs: undefined;
  TaskerJobDetails: { jobId: string };
  TaskerPlaceBid: { jobId: string };
  TaskerProfile: undefined;
  TaskerReviews: undefined;
  TaskerMyProfile: undefined;
  TaskerEditProfile: { initialTab?: 'About Me' | 'Services Info' | 'Portfolio' } | undefined;
  TaskerNotifications: undefined;
  TaskerWallet: undefined;
  LegalWebView: LegalWebViewParams;
  TaskerSupport: undefined;
  TaskerChat: { taskId: string | number; receiverId: number; title?: string };
};
