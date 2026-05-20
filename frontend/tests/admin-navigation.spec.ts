import { test, expect } from '@playwright/test'

test.describe('Admin navigation', () => {
  test('Add Property links to editor', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('link', { name: '+ Add Property' }).click()
    await expect(page).toHaveURL(/\/admin\/properties/)
    await expect(page.getByText('Add New Property')).toBeVisible()
  })

  test('View button opens property details', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Properties' }).click()
    const viewLink = page.getByRole('link', { name: 'View' }).first()
    await viewLink.click()
    await expect(page).toHaveURL(/\/properties\//)
  })
})
