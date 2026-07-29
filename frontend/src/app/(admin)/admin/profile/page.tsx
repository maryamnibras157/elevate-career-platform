import { redirect } from 'next/navigation';

export default function ProfileRootPage() {
  redirect('/admin/profile/account');
}
