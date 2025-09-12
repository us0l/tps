import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home/Home';
import NotFound from './pages/NotFound';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Home />,
      children: [
        {
          // Catch-all route for 404 errors
          path: '*',
          element: <NotFound />,
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
