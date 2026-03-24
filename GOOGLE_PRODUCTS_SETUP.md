# Google Products Setup

## Recommendation

Use the same Google Sheets file you already use for orders.
Create a new tab named `Produits` in that same file.

Recommended tabs:
- `Commandes`
- `Produits`

This keeps everything in one place and lets the owner update products without touching the code.

## Products sheet columns

Create these columns in the `Produits` tab, in this order:

- `id`
- `slug`
- `name`
- `nameAr`
- `baseName`
- `baseNameAr`
- `color`
- `colorAr`
- `variantGroup`
- `category`
- `collection`
- `collectionAr`
- `price`
- `oldPrice`
- `quantity`
- `image`
- `shortDescription`
- `shortDescriptionAr`
- `features`
- `featuresAr`
- `availability`
- `availabilityAr`
- `featured`
- `published`
- `tags`

## Images from Google Drive

Store the image in Google Drive and put only the link in the `image` column.
The site will normalize common Drive links automatically.

Accepted formats include:
- `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
- `https://drive.google.com/open?id=FILE_ID`
- direct image URLs

## Separate Apps Script for products

Keep products and orders separate.

- orders: `google-apps-script.js`
- products: `google-products-apps-script.js`

That means:
- one `/exec` for orders
- one different `/exec` for products

## Products Apps Script setup

1. Copy `google-products-apps-script.js` into a dedicated Apps Script project.
2. Replace `YOUR_SPREADSHEET_ID`.
3. Make sure the `Produits` tab exists in the same spreadsheet.
4. Deploy as Web App.
5. Set:
   - `Execute as: Me`
   - `Who has access: Anyone`

## Products JSON URL

Your products feed URL will be the `/exec` URL of the products Apps Script deployment.
Example:

```text
https://script.google.com/macros/s/YOUR_PRODUCTS_DEPLOYMENT_ID/exec
```

## Site configuration

Add this environment variable locally and on Netlify:

```env
PRODUCTS_FEED_URL=https://script.google.com/macros/s/YOUR_PRODUCTS_DEPLOYMENT_ID/exec
```

The site now does this:
- try `PRODUCTS_FEED_URL`
- if it fails, fall back to local products from `src/data/products.ts`

That means you can set up the sheet progressively without breaking the site.

## What the owner does

The owner only needs to:
- open the `Produits` tab
- add or edit rows
- paste the Drive image link
- set `published` to `TRUE` or `FALSE`

Use `published = FALSE` instead of deleting rows when possible.

## Current integration

The following parts of the site are already wired to this product source:
- home page
- catalogue
- Arabic home page
- Arabic catalogue
- product detail pages
- Arabic product detail pages

## Next step

After you create the `Produits` tab, send me:
- the spreadsheet ID
- the products Apps Script `/exec` URL

Then I can help you validate the products JSON and finish the last checks.
