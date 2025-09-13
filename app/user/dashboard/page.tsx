import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/auth';
import { SignOut } from '@/components/buttons.component';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.role) {
        redirect('/user/signin?error=missing-role');
    }

    return (
        <div>
            <h1>User Dashboard</h1>
            <pre>{JSON.stringify(session, null, 2)}</pre>
            <SignOut />
        </div>
    );
}
