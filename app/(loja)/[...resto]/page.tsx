import { notFound } from 'next/navigation';

// Unknown URLs would otherwise skip the store layout and lose its header and footer.
export default function UnknownPage() {
  notFound();
}
