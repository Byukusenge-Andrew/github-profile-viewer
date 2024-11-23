# GitHub Profile Viewer

A web application built with Vue.js that allows users to view GitHub profiles, including contribution activity and top languages used.

## Features

- Search for GitHub users by username
- Display user profile information
- Show contribution activity over the past year
- List top languages used in repositories
- View repositories with details like stars and forks


## Technologies Used

- Vue.js
- Tailwind CSS
- GitHub GraphQL API
- Axios

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/github-profile-viewer.git
   cd github-profile-viewer
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up your GitHub token:**

   To access the GitHub API, you'll need a personal access token. Follow these steps to create one:

   - Go to [GitHub Settings](https://github.com/settings/tokens).
   - Click on **Generate new token**.
   - Give your token a descriptive name.
   - Select the following scopes:
     - `read:user` - Access user profile data
     - `repo` - Access repository data
   - Click **Generate token** and copy the token.

   Create a `.env` file in the root directory and add your GitHub token:

   ```env
   VITE_GITHUB_TOKEN=your_github_token
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**

   Visit `http://localhost:3000` to view the application.

## Usage

- Enter a GitHub username in the search bar and press "Search" to view the profile.
- Toggle between light and dark mode using the button in the top-right corner.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.


## Contact

For questions or feedback, please contact [andrebyukusenge9@gmail.com](mailto:andrebyukusenge9@gmail.com).