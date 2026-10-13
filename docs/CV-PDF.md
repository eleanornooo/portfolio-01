# CV PDF — still needed

The **Download CV** button points to `/CV_Aziz_Mimoudi_2026.pdf`.

Put the file at `public/CV_Aziz_Mimoudi_2026.pdf` and rebuild. Until the file exists the
button is hidden automatically (see `__HAS_CV__` in `vite.config.ts`), so the site never
shows a broken link.

**Before publishing the PDF, remove the private header block** that the Word CV contains:
date of birth, home address in Rabat and personal phone number. A public CV should only
show the professional email, ORCID/Scholar links and the institutional address.
