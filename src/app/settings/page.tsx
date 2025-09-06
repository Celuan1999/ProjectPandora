"use client"

import { useState } from 'react';
import Button, { ColorTypes } from '../components/ui/button';

// Mock data for the profile settings
const mockUserData = {
  personalInfo: {
    name: "John Smith",
    email: "john.smith@company.com",
    profilePicture: "https://t4.ftcdn.net/jpg/03/32/59/65/360_F_332596535_lAdLhf6KzbW6PWXBWeIFTovTii1drkbT.jpg"
  },
  organizationInfo: {
    organizationName: "Defense Solutions Inc.",
    department: "Engineering",
    role: "Manager",
    clearanceLevel: "Secret"
  },
  securitySettings: {
    mfaEnabled: true,
    lastPasswordChange: "2024-01-15",
    activeSessions: 2
  },
  activity: {
    lastLogin: "2024-01-20 14:30:00",
    accountCreated: "2023-06-15",
    recentActivity: [
      { action: "File Upload", project: "Project Alpha", time: "2 hours ago" },
      { action: "File Download", project: "Project Beta", time: "1 day ago" },
      { action: "P2P Transfer", project: "Secure Message", time: "3 days ago" }
    ],
    p2pTransfers: [
      { type: "Sent", recipient: "jane.doe@company.com", time: "3 days ago" },
      { type: "Received", sender: "bob.wilson@company.com", time: "1 week ago" }
    ]
  }
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(mockUserData);

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'activity', label: 'Activity', icon: '📊' },
    { id: 'admin', label: 'Admin', icon: '⚙️' }
  ];

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // Mock save functionality
    console.log('Saving settings:', formData);
    setIsEditing(false);
    // Here you would typically call an API to save the settings
  };

  const handleCancel = () => {
    setFormData(mockUserData);
    setIsEditing(false);
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <img
            src={formData.personalInfo.profilePicture}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
          {isEditing && (
            <button className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold">{formData.personalInfo.name}</h3>
          <p className="text-gray-600">{formData.personalInfo.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.personalInfo.name}
              onChange={(e) => handleInputChange('personalInfo', 'name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{formData.personalInfo.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <p className="text-gray-900">{formData.personalInfo.email}</p>
          <p className="text-xs text-gray-500 mt-1">Contact admin to change email</p>
        </div>
      </div>
    </div>
  );

  const renderOrganizationInfo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Organization Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
          <p className="text-gray-900">{formData.organizationInfo.organizationName}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
          <p className="text-gray-900">{formData.organizationInfo.department}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <p className="text-gray-900">{formData.organizationInfo.role}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Security Clearance</label>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
              {formData.organizationInfo.clearanceLevel}
            </span>
            <span className="text-xs text-gray-500">Admin managed</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Multi-Factor Authentication</h4>
            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              formData.securitySettings.mfaEnabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {formData.securitySettings.mfaEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <Button 
              color={ColorTypes.secondary}
              onClick={() => handleInputChange('securitySettings', 'mfaEnabled', !formData.securitySettings.mfaEnabled)}
            >
              {formData.securitySettings.mfaEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Change Password</h4>
            <p className="text-sm text-gray-600">Last changed: {formData.securitySettings.lastPasswordChange}</p>
          </div>
          <Button color={ColorTypes.secondary}>Change Password</Button>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Active Sessions</h4>
            <p className="text-sm text-gray-600">{formData.securitySettings.activeSessions} active sessions</p>
          </div>
          <Button color={ColorTypes.secondary}>Manage Sessions</Button>
        </div>
      </div>
    </div>
  );


  const renderActivity = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Activity & Audit</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Account Information</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Login:</span>
              <span className="text-sm text-gray-900">{formData.activity.lastLogin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Account Created:</span>
              <span className="text-sm text-gray-900">{formData.activity.accountCreated}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Recent Activity</h4>
          <div className="space-y-2">
            {formData.activity.recentActivity.map((activity, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{activity.action} - {activity.project}</span>
                <span className="text-gray-900">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">P2P Transfer History</h4>
        <div className="space-y-2">
          {formData.activity.p2pTransfers.map((transfer, index) => (
            <div key={index} className="flex justify-between text-sm p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">
                {transfer.type} to/from {transfer.type === 'Sent' ? transfer.recipient : transfer.sender}
              </span>
              <span className="text-gray-900">{transfer.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAdminSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Administrative Settings</h3>
      <p className="text-sm text-gray-600">These settings are only available to administrators.</p>
      
      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">User Management</h4>
          <p className="text-sm text-gray-600 mb-4">Manage user accounts, roles, and permissions</p>
          <Button color={ColorTypes.secondary}>Manage Users</Button>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Audit Logs</h4>
          <p className="text-sm text-gray-600 mb-4">View system audit logs within your clearance level</p>
          <Button color={ColorTypes.secondary}>View Audit Logs</Button>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Clearance Management</h4>
          <p className="text-sm text-gray-600 mb-4">Reassign file and project clearance levels</p>
          <Button color={ColorTypes.secondary}>Manage Clearance</Button>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Organization Settings</h4>
          <p className="text-sm text-gray-600 mb-4">Configure organization-wide settings and policies</p>
          <Button color={ColorTypes.secondary}>Organization Settings</Button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="space-y-8">
            {renderPersonalInfo()}
            {renderOrganizationInfo()}
          </div>
        );
      case 'security':
        return renderSecuritySettings();
      case 'activity':
        return renderActivity();
      case 'admin':
        return renderAdminSettings();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
          </div>
          
          {/* Action Buttons */}
          {activeTab === 'personal' && (
            <div className="flex space-x-4">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button color={ColorTypes.secondary} onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
