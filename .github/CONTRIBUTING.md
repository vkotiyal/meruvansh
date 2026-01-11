# Contributing to MeruVansh

Thank you for your interest in contributing to MeruVansh! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report:

1. Check the [existing issues](https://github.com/vkotiyal/meruvansh/issues) to avoid duplicates
2. Gather relevant information about the bug
3. Create a detailed bug report using our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)

### Suggesting Features

We welcome feature suggestions! Please:

1. Check [existing feature requests](https://github.com/vkotiyal/meruvansh/issues?q=is%3Aissue+label%3Aenhancement)
2. Use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
3. Provide clear use cases and examples

### Code Contributions

#### Development Setup

1. **Fork the repository**

   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**

   ```bash
   git clone https://github.com/vkotiyal/meruvansh.git
   cd meruvansh
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your local values (see [PostgreSQL Setup](../docs/POSTGRESQL_SETUP.md)).

5. **Set up the database**

   ```bash
   # Start PostgreSQL
   brew services start postgresql@16

   # Create database
   createdb meruvansh

   # Run migrations
   npx prisma generate
   npx prisma db push
   ```

6. **Start development server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000)

#### Development Workflow

1. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

   Branch naming conventions:
   - `feature/` - New features
   - `fix/` - Bug fixes
   - `docs/` - Documentation updates
   - `refactor/` - Code refactoring
   - `perf/` - Performance improvements

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes**

   ```bash
   # Run linter
   npm run lint

   # Check types
   npm run type-check

   # Format code
   npm run format

   # Build
   npm run build
   ```

4. **Commit your changes**

   We use [Conventional Commits](https://www.conventionalcommits.org/):

   ```bash
   git commit -m "feat: add user profile avatars"
   git commit -m "fix: resolve authentication redirect loop"
   git commit -m "docs: update deployment guide"
   ```

   Commit types:
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code style changes (formatting, etc.)
   - `refactor`: Code refactoring
   - `perf`: Performance improvements
   - `test`: Adding or updating tests
   - `chore`: Maintenance tasks

   Husky will automatically:
   - ✅ Lint your code
   - ✅ Check commit message format
   - ✅ Format staged files

5. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the [PR template](.github/pull_request_template.md)
   - Submit the PR

#### Pull Request Guidelines

**Before submitting:**

- [ ] Code follows project style guidelines
- [ ] Self-reviewed the code
- [ ] Added comments for complex code
- [ ] Updated documentation if needed
- [ ] All CI checks pass
- [ ] Tested on multiple browsers (if UI changes)
- [ ] Checked responsive design (if UI changes)

**PR Title Format:**

Use conventional commit format:

```
feat: add export to PDF functionality
fix: resolve tree rendering issue on mobile
docs: update API documentation
```

**Review Process:**

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited in release notes

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Define interfaces for all data structures
- Avoid `any` type unless absolutely necessary
- Use descriptive variable names

```typescript
// Good
interface UserProfile {
  id: string
  name: string
  email: string
}

const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  // ...
}

// Avoid
const fetchData = async (id: any) => {
  // ...
}
```

### React Components

- Use functional components with hooks
- Keep components focused and small
- Extract complex logic into custom hooks
- Use proper TypeScript types for props

```typescript
// Good
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}
```

### File Organization

```
app/
  (auth)/          # Route group for authentication
  (dashboard)/     # Route group for dashboard
  api/             # API routes
components/
  ui/              # Reusable UI components
  tree/            # Tree-specific components
lib/               # Utility functions and configs
prisma/            # Database schema
docs/              # Documentation
```

### Naming Conventions

- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions**: camelCase (`getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_UPLOAD_SIZE`)
- **Interfaces**: PascalCase (`UserProfile`)

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use Shadcn/ui components when possible
- Maintain consistent spacing and colors

## Database Changes

If your contribution requires database changes:

1. **Update Prisma schema** (`prisma/schema.prisma`)
2. **Generate migration**
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```
3. **Test migration** on a fresh database
4. **Document changes** in PR description

## Documentation

- Update README.md for new features
- Add/update docs/ files for complex features
- Include code comments for complex logic
- Update API documentation if endpoints change

## Testing

While we don't have a full test suite yet, please:

- Manually test all changes thoroughly
- Test on multiple browsers (Chrome, Firefox, Safari)
- Test responsive design on mobile/tablet/desktop
- Verify authentication flows still work
- Test with different user scenarios

## Getting Help

- **Questions**: Open a [GitHub Discussion](https://github.com/vkotiyal/meruvansh/discussions)
- **Bugs**: Create an [Issue](https://github.com/vkotiyal/meruvansh/issues)
- **Chat**: Join our [Discord](#) (if available)

## Recognition

Contributors will be:

- Listed in README.md
- Credited in release notes
- Mentioned in relevant documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to MeruVansh! 🌳
