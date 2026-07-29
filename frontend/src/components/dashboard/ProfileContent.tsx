'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { userService } from '@/services/user.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getInitials, formatDate } from '@/lib/utils';
import { capitalize } from '@/lib/utils';
import { toast } from 'sonner';
import { Briefcase, GraduationCap, MapPin, Code } from 'lucide-react';

export function ProfileContent() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = fullName.trim();
    if (!trimmed || trimmed === user?.full_name) return;
    setIsSaving(true);
    try {
      await userService.updateProfile({ full_name: trimmed });
      await refreshUser();
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your personal information.</p>
      </div>

      {/* Profile card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {user ? getInitials(user.full_name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-semibold">{user?.full_name}</h2>
                <Badge variant="outline" className="text-xs">
                  {user ? capitalize(user.role) : 'Student'}
                </Badge>
                {user?.is_verified && (
                  <Badge variant="success" className="text-xs">Verified</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {user?.created_at ? formatDate(user.created_at) : 'N/A'}
              </p>
            </div>
            <Button variant="outline" size="sm">Edit photo</Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>Update your name and public profile details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Full name"
            id="profile-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />
          <Input
            label="Email address"
            id="profile-email"
            type="email"
            defaultValue={user?.email}
            disabled
            hint="Email cannot be changed."
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSave} isLoading={isSaving}>
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">B.S. Computer Science</p>
              <p className="text-xs text-muted-foreground">University of Technology • 2018 - 2022</p>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2">Add Education</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Software Engineer Intern</p>
              <p className="text-xs text-muted-foreground">Tech Innovations Inc. • 2021 - 2022</p>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2">Add Experience</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Code className="h-5 w-5 text-muted-foreground" />
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Node.js', 'Python', 'FastAPI', 'PostgreSQL', 'Docker'].map(skill => (
              <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm font-normal">
                {skill}
              </Badge>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4">Edit Skills</Button>
        </CardContent>
      </Card>
    </div>
  );
}
