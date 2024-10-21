import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Main } from './components/layouts';
import { userProfileData } from './data';
import { Grant, Home } from './pages';
import { AgileSearch } from './pages/agile-search';
import { FiltersProvider } from './pages/agile-search/context/filters';
import { StepProvider } from './pages/agile-search/context/steps';

const router = createBrowserRouter([
	{
		id: 'main',
		path: '/',
		element: <Main />,
		children: [
			{
				id: 'home',
				index: true,
				path: '/',
				element: <Home />,
			},
			{
				id: 'agile-search',
				path: 'agile-search',
				element: (
					<FiltersProvider userProfile={userProfileData}>
						<StepProvider>
							<AgileSearch />
						</StepProvider>
					</FiltersProvider>
				),
			},
			{
				id: 'search',
				path: 'search',
				element: <Navigate to='/' />,
			},
			{
				id: 'grant',
				path: 'search/:id',
				element: <Grant />,
			}
		]
	}
]);

export default function App() {
  return (
    <RouterProvider router={router} fallbackElement={<p>Initial Load...</p>} />
  );
}

