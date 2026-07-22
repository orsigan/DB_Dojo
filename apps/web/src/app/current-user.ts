export interface CurrentUser {
  name: string;
  email: string;
  initials: string;
}

export const currentUser: CurrentUser = {
  name: 'Guest Learner',
  email: 'guest@db-dojo.local',
  initials: 'GL'
};
