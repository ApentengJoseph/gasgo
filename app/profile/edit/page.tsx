import { redirect } from 'next/navigation';

// Details are now edited directly on the Account page.
export default function EditProfileRedirect() {
  redirect('/profile');
}
