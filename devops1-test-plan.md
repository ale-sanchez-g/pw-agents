# DevOps1.com.au - Comprehensive Test Plan

## Application Overview

DevOps1.com.au is a corporate website for a digital transformation consultancy specializing in DevSecOps and cloud engineering services. The website features:

- **Company Presentation**: Corporate homepage with service offerings, client testimonials, and company values
- **Service Portfolio**: Detailed information about Digital Immunity, Cloud & Platform Engineering, Security Engineering, and Quality & Observability services
- **Engagement Models**: Three distinct engagement approaches (Advise, Optimise, Accelerate)
- **Contact Functionality**: Multi-field contact form with reCAPTCHA verification
- **Company Information**: About page with team profiles, core values, and company statistics
- **Partner Ecosystem**: Technology partnerships with GitLab, AWS, Atlassian, and other platforms
- **Location Information**: Sydney and Melbourne office details with embedded maps
- **Navigation System**: Dropdown menus for Services, Engage, Company sections

## Test Scenarios

### 1. Website Navigation and Content Exploration

**Seed:** `tests/seed.spec.ts`

#### 1.1 Homepage Content Verification
**Steps:**
1. Navigate to https://devops1.com.au/
2. Verify the main heading "Anticipate is the first line of defence" is visible
3. Confirm the DevOps1 logo is displayed in the top navigation
4. Check that the main navigation menu contains: Services, Engage, Projects, Company, FluxQE
5. Verify the "Contact us" and "Buy in AWS" buttons are visible in the top right
6. Scroll down to verify the "Digital Immune System" section with 4 pillars: Anticipate, Secure & Assure, Adapt & Evolve, Cloud & Platform

**Expected Results:**
- Homepage loads successfully with proper branding
- All navigation elements are functional and visible
- Core messaging about Digital Immunity is prominently displayed
- Client logos and testimonials are visible

#### 1.2 Services Navigation and Content
**Steps:**
1. Click on "Services" in the main navigation
2. Verify dropdown menu appears with 4 service categories:
   - Build Digital Immunity
   - Cloud & Platform Engineering
   - Security Engineering
   - Quality & Observability
3. Click on "Build Digital Immunity"
4. Verify navigation to /services/digital-immunity page
5. Confirm page contains "Digital Immunity" heading
6. Check for the "Choose your path to immunity" 4-step process
7. Navigate back and test each service page

**Expected Results:**
- Dropdown menus function properly
- Service pages load with relevant content
- Navigation maintains consistency across pages
- Service descriptions are comprehensive and professional

#### 1.3 Company Information Navigation
**Steps:**
1. From homepage, click "Company" in navigation
2. Verify dropdown shows "About" and "Partners" options
3. Navigate to /about page
4. Verify "We are technology obsessed" main heading
5. Scroll to "Our team" section and verify team member profiles
6. Check LinkedIn links for team members
7. Verify core values section with 6 values displayed
8. Confirm "Join the team" link directs to careers

**Expected Results:**
- About page loads with comprehensive company information
- Team profiles display with photos and LinkedIn links
- Core values are clearly articulated
- Professional presentation maintained throughout

### 2. Contact Form Functionality Testing

**Seed:** `tests/seed.spec.ts`

#### 2.1 Contact Form - Valid Submission
**Steps:**
1. Navigate to https://devops1.com.au/contact
2. Fill in "First Name" field with "John"
3. Fill in "Last Name" field with "Smith"
4. Fill in "Email address" field with "john.smith@example.com"
5. Fill in "Phone" field with "+61 2 1234 5678"
6. Fill in "Company Name" field with "Test Company"
7. Fill in "How did you hear about us?" field with "Search Engine"
8. Check the reCAPTCHA "I'm not a robot" checkbox
9. Click "Send Message" button

**Expected Results:**
- All form fields accept valid input
- reCAPTCHA validation works properly
- Form submission processes (success message or confirmation)
- No JavaScript errors in console

#### 2.2 Contact Form - Field Validation
**Steps:**
1. Navigate to contact page
2. Leave all fields empty and click "Send Message"
3. Verify validation messages appear for required fields
4. Fill "Email address" with invalid format "notanemail"
5. Attempt submission and verify email validation
6. Test maximum character limits in text fields
7. Test phone field with various international formats

**Expected Results:**
- Required field validation prevents submission
- Email format validation works correctly
- Appropriate error messages are displayed
- Form maintains data when validation fails

#### 2.3 Contact Information Verification
**Steps:**
1. On contact page, verify Sydney office address: "Mezzanine Level (North), 50 Carrington Street, Sydney NSW 2000"
2. Verify Melbourne office address: "CBD, Melbourne VIC 3000"
3. Test email links:
   - hello@devops1.com.au (General)
   - sales@devops1.com.au (Sales)
   - partners@devops1.com.au (Partners)
   - careers@devops1.com.au (Careers)
4. Verify embedded maps load properly for both offices

**Expected Results:**
- Contact information is accurate and up-to-date
- Email links open default mail client
- Maps display correct office locations
- All contact methods are functional

### 3. Interactive Elements and External Links

**Seed:** `tests/seed.spec.ts`

#### 3.1 External Partner Links
**Steps:**
1. From homepage, scroll to "Our trusted clients" section
2. Verify client logos are displayed (RBA, ACS, Digital Health, etc.)
3. Scroll to "Technology Partners" section
4. Click "View all partners" link
5. Test "Buy in AWS" button functionality
6. Verify it opens AWS Marketplace profile
7. Test partner award links (GitLab APAC Partner award)

**Expected Results:**
- External links open in new tabs/windows
- AWS Marketplace link functions correctly
- Partner pages load without errors
- Award announcements link to appropriate pages

#### 3.2 Digital Immunity System Interaction
**Steps:**
1. From homepage, locate "Digital Immune System" diagram
2. Click on each pillar button:
   - Anticipate
   - Secure & Assure  
   - Adapt & Evolve
   - Cloud & Platform
3. Verify clicking changes the hero section content
4. Test navigation between different immunity themes
5. Verify "Learn more" buttons navigate to appropriate service pages

**Expected Results:**
- Interactive elements respond to clicks
- Content dynamically updates based on selection
- Navigation to service pages works correctly
- Visual feedback indicates active selection

#### 3.3 Engagement Model Navigation
**Steps:**
1. Scroll to "Tailored engagement models" section
2. Click on each engagement model:
   - Advise (/engage/advise)
   - Optimise (/engage/optimise)
   - Accelerate (/services/accelerate)
3. Verify each page loads with relevant content
4. Test "devops_1 way" links functionality
5. Navigate back to homepage using breadcrumbs or logo

**Expected Results:**
- All engagement model pages load successfully
- Content is relevant to each engagement type
- Navigation maintains consistency
- Return navigation functions properly

### 4. Responsive Design and Cross-Device Testing

**Seed:** `tests/seed.spec.ts`

#### 4.1 Desktop Responsiveness (1920x1080)
**Steps:**
1. Set browser viewport to 1920x1080
2. Navigate through all main pages (Home, Services, About, Contact)
3. Verify navigation menu layout and functionality
4. Check footer content visibility and organization
5. Verify form layout on contact page
6. Test scrolling behavior and content alignment

**Expected Results:**
- Content displays properly at full desktop resolution
- Navigation remains functional and well-positioned
- Forms and interactive elements are appropriately sized
- No horizontal scrolling required

#### 4.2 Tablet Responsiveness (768x1024)
**Steps:**
1. Set browser viewport to 768x1024 (iPad portrait)
2. Test navigation menu behavior (hamburger menu if present)
3. Verify contact form usability on tablet
4. Check team member grid layout on About page
5. Test touch interactions on interactive elements
6. Verify map functionality on contact page

**Expected Results:**
- Layout adapts appropriately for tablet viewing
- Navigation remains accessible and functional
- Touch targets are appropriately sized
- Content reflows without overlap or cutting

#### 4.3 Mobile Responsiveness (375x667)
**Steps:**
1. Set browser viewport to 375x667 (iPhone SE)
2. Test mobile navigation menu functionality
3. Verify contact form is usable on mobile
4. Check that all content is accessible without horizontal scrolling
5. Test team member profiles display on mobile
6. Verify footer links remain functional

**Expected Results:**
- Mobile navigation provides access to all sections
- Forms remain usable with appropriate input sizing
- Content stacks vertically without overlap
- Loading times remain reasonable on mobile viewport

### 5. Performance and Technical Validation

**Seed:** `tests/seed.spec.ts`

#### 5.1 Page Load Performance
**Steps:**
1. Navigate to homepage and measure load time
2. Check for console errors during page load
3. Verify LaunchDarkly initialization messages
4. Test navigation between pages for performance
5. Monitor network requests for optimization opportunities
6. Verify images load properly across all pages

**Expected Results:**
- Pages load within acceptable timeframes (< 3 seconds)
- No critical JavaScript errors in console
- Third-party integrations (LaunchDarkly, reCAPTCHA) function properly
- Images display correctly with appropriate compression

#### 5.2 SEO and Accessibility Validation
**Steps:**
1. Verify each page has appropriate title tags
2. Check for proper heading hierarchy (H1, H2, H3, etc.)
3. Verify alt text is present for images
4. Test keyboard navigation through forms and links
5. Check color contrast for accessibility compliance
6. Verify form labels are properly associated with inputs

**Expected Results:**
- Page titles are descriptive and unique
- Heading structure follows logical hierarchy
- Images have descriptive alt text
- Site is navigable using keyboard only
- Meets WCAG accessibility guidelines

### 6. Error Handling and Edge Cases

**Seed:** `tests/seed.spec.ts`

#### 6.1 Network Error Handling
**Steps:**
1. Simulate slow network conditions
2. Test form submission with network interruption
3. Verify graceful handling of external service failures (maps, reCAPTCHA)
4. Test 404 error handling by navigating to non-existent pages
5. Verify proper error messages are displayed

**Expected Results:**
- Site remains functional under poor network conditions
- Error states provide helpful user feedback
- External service failures don't break core functionality
- 404 pages provide navigation back to main content

#### 6.2 Browser Compatibility Testing
**Steps:**
1. Test core functionality in Chrome (latest)
2. Test core functionality in Firefox (latest)
3. Test core functionality in Safari (if available)
4. Verify JavaScript features work across browsers
5. Test form submission in different browsers
6. Verify CSS rendering consistency

**Expected Results:**
- Core functionality works across modern browsers
- Visual consistency maintained across platforms
- JavaScript features degrade gracefully if unsupported
- Forms function properly in all tested browsers

## Summary and Recommendations

This comprehensive test plan covers all major aspects of the DevOps1.com.au website including:

- **Functional Testing**: Navigation, forms, and interactive elements
- **Content Verification**: Accuracy and completeness of company information
- **User Experience**: Responsive design and accessibility
- **Performance**: Load times and technical optimization
- **Error Handling**: Graceful degradation and error states

**Key Areas for Focus:**
1. Contact form validation and submission workflow
2. Responsive design across device sizes
3. External link functionality and partner integrations
4. Interactive Digital Immunity system components
5. Professional presentation and content accuracy

**Testing Priority:**
- High: Contact form, navigation, service pages
- Medium: Responsive design, performance
- Low: Edge cases, browser compatibility

This test plan ensures comprehensive coverage of visitor exploration scenarios while maintaining focus on business-critical functionality and user experience quality.