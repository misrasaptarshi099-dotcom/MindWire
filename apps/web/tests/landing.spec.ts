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
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': 'http://localhost:5173',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true',
          }
        });
        return;
      }
      
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:5173',
          'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify({
          success: true,
          message: 'Enquiry submitted successfully',
          data: { enquiryId: 'mock-enquiry-123', referenceCode: 'MW-TEST-999' }
        })
      });
    });

    await page.route('**/api/payment/create-checkout-session', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': 'http://localhost:5173',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true',
          }
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:5173',
          'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify({
          success: true,
          checkoutUrl: 'http://localhost:5173/?payment=mock_success&ref=MW-TEST-999',
        })
      });
    });

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('request', req => console.log('REQUEST:', req.url()));

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
    await page.selectOption('select[name="batchId"]', 'b-1');
    
    // Submit form and verify the checkout API was called (proves the full
    // enquiry → payment flow executed). We listen for the checkout request
    // BEFORE clicking, then click, then await the request.
    const checkoutRequestPromise = page.waitForRequest('**/api/payment/create-checkout-session');
    const submitButton = page.locator('button:has-text("Proceed to Payment")');
    await submitButton.click();
    const checkoutRequest = await checkoutRequestPromise;
    expect(checkoutRequest.method()).toBe('POST');
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

  // Integration test: runs locally with `npm run dev` (full stack).
  // Skipped in CI because the API needs MongoDB — using production credentials
  // in CI would pollute the live database with test data.
  test('should complete the full authenticated enquiry and checkout API flow without mocking', async ({ request }) => {
    test.skip(!!process.env.CI, 'Needs live API + database (only runs locally with npm run dev)');

    // Dynamically skip if the local API server isn't running
    try {
      await request.get('http://127.0.0.1:8080/api/health', { timeout: 2000 });
    } catch {
      test.skip(true, 'Local API server (port 8080) is not running. Start the backend to run this integration test.');
    }

    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    
    // 1. Register a new user
    const registerResponse = await request.post('http://127.0.0.1:8080/api/auth/register', {
      data: {
        name: 'Test Parent',
        email: uniqueEmail,
        password: 'Password123!',
      }
    });
    expect(registerResponse.ok()).toBeTruthy();
    const registerData = await registerResponse.json();
    const token = registerData.data.token;
    
    // 2. Create an enquiry using the same email
    const enquiryResponse = await request.post('http://127.0.0.1:8080/api/enquiry', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        name: 'Test Parent',
        email: uniqueEmail,
        phone: '9876543210',
        childName: 'Test Kid',
        childAge: 10,
        workshopId: 'AI_ROBOTICS_SUMMER_2026',
        batchId: 'BATCH_01',
        message: 'Integration test',
      }
    });
    expect(enquiryResponse.ok()).toBeTruthy();
    const enquiryData = await enquiryResponse.json();
    const enquiryId = enquiryData.data.enquiryId;
    
    // 3. Request a checkout session (must pass protect and email check)
    const checkoutResponse = await request.post('http://127.0.0.1:8080/api/payment/create-checkout-session', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        enquiryId
      }
    });
    expect(checkoutResponse.ok()).toBeTruthy();
    const checkoutData = await checkoutResponse.json();
    expect(checkoutData.success).toBe(true);
    const validUrl = checkoutData.checkoutUrl.startsWith('https://checkout.stripe.com') || checkoutData.checkoutUrl.includes('payment=mock_success');
    expect(validUrl).toBe(true);
  });
});
