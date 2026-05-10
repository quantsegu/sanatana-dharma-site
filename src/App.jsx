import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import TopicPage from './pages/TopicPage';
import TimelinePage from './pages/TimelinePage';
import KnowledgeGraphPage from './pages/KnowledgeGraphPage';
import BookmarksPage from './pages/BookmarksPage';
import LibraryPage from './pages/LibraryPage';
import TopicSummaryPage from './pages/TopicSummaryPage';
import AssistantPage from './pages/AssistantPage';
import LivingGuidePage from './pages/LivingGuidePage';
import VideosPage from './pages/VideosPage';
import BlogIndexPage from './pages/BlogIndexPage';
import BlogPostPage from './pages/BlogPostPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminShell from './pages/admin/AdminShell';
import AdminVideos from './pages/admin/AdminVideos';
import AdminBlogs from './pages/admin/AdminBlogs';
import './App.css';

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminShell />}>
        <Route index element={<Navigate to="videos" replace />} />
        <Route path="videos" element={<AdminVideos />} />
        <Route path="blogs" element={<AdminBlogs />} />
      </Route>

      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="knowledge-graph" element={<KnowledgeGraphPage />} />
        <Route path="bookmarks" element={<BookmarksPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="assistant" element={<AssistantPage />} />
        <Route path="living-guide" element={<LivingGuidePage />} />
        <Route path="videos" element={<VideosPage />} />
        <Route path="blog" element={<BlogIndexPage />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />
        <Route path="topic/:topicId/summary" element={<TopicSummaryPage />} />
        <Route path="topic/:topicId" element={<TopicPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
