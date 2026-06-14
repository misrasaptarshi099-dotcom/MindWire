import { test, expect } from '@playwright/test';

test.describe('MindWire Landing Page & Interactive Flows', () => {
  
  test('should load the landing page and show the hero section', async ({ page }) => {
    await page.goto('/');
    
    // Check that the title "MindWire" is displayed
    const heroTitle = page.locator('h1');
    await expect(heroTitle).toContainText('MindWire');
    
    // Check for the "Begin Mission" CTA button
    const ctaButton = page.locator('button:has-text("Begin Mission")');
    await expect(ctaButton).toBeVisible();
  });

  test('should validate the registration form inputs', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to the registration form
    const registerSection = page.locator('#register');
    await registerSection.scrollIntoViewIfNeeded();
    
    // Click submit without entering details
    const submitButton = page.locator('button:has-text("Proceed to Payment")');
    await submitButton.click();
    
    // Assert validation errors are visible
    await expect(page.locator('text=Name must be at least 2 characters.')).toBeVisible();
    await expect(page.locator('text=Invalid email address.')).toBeVisible();
    await expect(page.locator('text=Phone number must be a valid 10-digit Indian mobile number.')).toBeVisible();
  });

  test('should submit the registration form successfully with mocked API', async ({ page }) => {
    // Intercept API GET request to /api/workshop
    await page.route('**/api/workshop', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [{
            workshopId: 'AI_ROBOTICS_SUMMER_2026',
            title: 'Mock Workshop',
            feeINR: 4999,
            ageGroup: { min: 8, max: 14 },
            durationWeeks: 4,
            mode: 'online',
            startDate: new Date().toISOString(),
            batches: [{ batchId: 'b-1', name: 'Batch 1' }]
          }]
        })
      });
    });

    // Intercept API POST request to /api/enquiry
    await page.route('**/api/enquiry', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Enquiry submitted successfully',
          data: { enquiryId: 'mock-enquiry-123', referenceCode: 'MW-TEST-999' }
        })
      });
    });

    // Intercept API POST request to /api/payment/create-checkout-session
    await page.route('**/api/payment/create-checkout-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          checkoutUrl: '#mock-checkout',
        })
      });
    });

    await page.goto('/');
    
    // Scroll to form
    const registerSection = page.locator('#register');
    await registerSection.scrollIntoViewIfNeeded();
    
    // Fill the form
    await page.fill('input[name="name"]', 'Parent Name');
    await page.fill('input[name="email"]', 'parent@example.com');
    await page.fill('input[name="phone"]', '9876543210');
    await page.fill('input[name="childName"]', 'Kid Name');
    await page.fill('input[name="childAge"]', '10');
    
    // Submit form
    const submitButton = page.locator('button:has-text("Proceed to Payment")');
    await submitButton.click();
    
    // Verify checkout redirection
    await page.waitForURL('**/#mock-checkout');
  });

  test('should navigate to the admin login page', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Check that "Admin Access" header is visible
    const loginHeader = page.locator('h2:has-text("Admin Access")');
    await expect(loginHeader).toBeVisible();
    
    // Check that email and password fields exist
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
