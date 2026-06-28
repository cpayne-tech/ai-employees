import type { ReactNode } from "react";
import { PageContainer } from "@/ai-employees/components/page-container";
import { Sidebar } from "@/ai-employees/components/sidebar";
import { TopHeader } from "@/ai-employees/components/top-header";

type AppFrameProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function AppFrame({
  title,
  subtitle,
  eyebrow,
  actions,
  children
}: AppFrameProps) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <TopHeader
          actions={actions}
          eyebrow={eyebrow}
          subtitle={subtitle}
          title={title}
        />
        <PageContainer>{children}</PageContainer>
      </div>
    </div>
  );
}
