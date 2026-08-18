import React, { useState, useEffect } from 'react';
import { groupAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import CreateGroupModal from '../components/CreateGroupModal';
import JoinGroupModal from '../components/JoinGroupModal';
import AIChatDrawer from '../components/AIChatDrawer';
import ProfileModal from '../components/ProfileModal';

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);

  // Modals & Sliders
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [joinGroupOpen, setJoinGroupOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await groupAPI.getGroups();
      setGroups(res.data.data);
      if (!activeGroup && res.data.data.length > 0) {
        setActiveGroup(res.data.data[0]);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching channels:', err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div style={styles.layout}>
      <Sidebar
        groups={groups}
        activeGroup={activeGroup}
        onSelectGroup={(g) => setActiveGroup(g)}
        onOpenCreateGroup={() => setCreateGroupOpen(true)}
        onOpenJoinGroup={() => setJoinGroupOpen(true)}
        onOpenAIChat={() => setAiChatOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <ChatArea
        activeGroup={activeGroup}
        onGroupUpdated={fetchGroups}
      />

      {/* Global Application Modals */}
      <CreateGroupModal
        isOpen={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        onGroupCreated={(newGrp) => {
          setGroups([newGrp, ...groups]);
          setActiveGroup(newGrp);
        }}
      />

      <JoinGroupModal
        isOpen={joinGroupOpen}
        onClose={() => setJoinGroupOpen(false)}
        onGroupJoined={(joinedGrp) => {
          setGroups([joinedGrp, ...groups]);
          setActiveGroup(joinedGrp);
        }}
      />

      <AIChatDrawer
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
      />

      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-main)',
  },
};