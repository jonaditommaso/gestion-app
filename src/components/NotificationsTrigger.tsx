"use client";

import { Fragment, useState } from "react";
import { BellIcon } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { enUS, es, it } from "date-fns/locale";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { useGetNotifications } from "@/features/notifications/api/use-get-notifications";
import { useReadAllNotifications } from "@/features/notifications/api/use-read-all-notifications";
import { NotificationData } from "@/features/home/types";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { NotificationBodySeparator } from "@/features/notifications/types";

const DATE_LOCALES = { es, en: enUS, it };

const NotificationsTrigger = () => {
  const t = useTranslations("home");
  const locale = useLocale() as "es" | "en" | "it";
  const [open, setOpen] = useState<boolean>(false);
  const [olderLoaded, setOlderLoaded] = useState<number>(0);

  const { data, isLoading } = useGetNotifications();
  const { mutate: readAllNotifications, isPending: isReadingAll } = useReadAllNotifications();

  const notifications =
    ((data?.documents as NotificationData[] | undefined) ?? []);

  const unreadNotifications = notifications.filter((notification) => !notification.read);
  const readNotifications = notifications.filter((notification) => notification.read);

  const unreadCount = unreadNotifications.length;
  const totalCount = notifications.length;

  const minVisible = 5;
  const readNeededToFill = Math.max(0, minVisible - unreadNotifications.length);
  const initialReadChunk = readNotifications.slice(0, readNeededToFill);

  const visibleNotifications = [
    ...unreadNotifications,
    ...initialReadChunk,
    ...readNotifications.slice(readNeededToFill, readNeededToFill + olderLoaded),
  ];

  const canLoadMore = readNotifications.length > readNeededToFill + olderLoaded;

  const badgeCount = unreadCount > 99 ? "99+" : String(unreadCount);

  const getTranslatedText = (value: string): string => {
    if (t.has(value))return t(value);

    return value;
  };

  const getRelativeTime = (date: string): string => {
    const createdAt = new Date(date);

    if (Number.isNaN(createdAt.getTime())) {
      return "";
    }

    return formatDistanceToNow(createdAt, {
      addSuffix: true,
      locale: DATE_LOCALES[locale] || DATE_LOCALES.en,
    });
  };

  const getBodyContent = (body: string) => {
    const bodyParts = body.split(NotificationBodySeparator);

    if (bodyParts.length === 2 && bodyParts[1].startsWith("/")) {
      const [bodyKey, href] = bodyParts;
      const linkLabel = getTranslatedText(bodyKey);

      return (
        <Link
          href={href}
          onClick={() => {
            if (unreadCount > 0 && !isReadingAll) {
              readAllNotifications();
            }

            setOpen(false);
          }}
          className="text-xs text-primary underline underline-offset-2 leading-5"
        >
          {linkLabel}
        </Link>
      );
    }

    return (
      <p className="text-xs text-muted-foreground leading-5 line-clamp-2">
        {getTranslatedText(body)}
      </p>
    );
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (nextOpen) {
          setOlderLoaded(0);
          return;
        }

        if (unreadCount > 0 && !isReadingAll) {
          readAllNotifications();
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer">
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 rounded-full h-5 min-w-5 px-1 flex items-center justify-center text-xs"
            >
              {badgeCount}
            </Badge>
          )}
          <Button
            aria-label={t("show-new-notifications", { count: unreadCount })}
            variant="outline"
            size="icon"
          >
            <BellIcon className="w-4 h-4" />
          </Button>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="px-3 py-2 border-b text-sm font-medium">
          {t("notifications")}
        </div>

        {isLoading ? (
          <div className="px-3 py-4 text-sm text-muted-foreground">
            {t("loading-notifications")}
          </div>
        ) : totalCount === 0 ? (
          <div className="px-3 py-4 text-sm text-muted-foreground">
            {t("no-notifications")}
          </div>
        ) : (
          <>
            <ScrollArea className="h-96">
              <div className="p-1">
                {visibleNotifications.map((notification, index) => (
                  <Fragment key={notification.$id}>
                    <div
                      className={cn(
                        "rounded-md px-3 py-2 transition-colors",
                        !notification.read
                          ? "bg-accent hover:bg-accent/80"
                          : "hover:bg-muted/60"
                      )}
                    >
                      <p className="text-sm font-medium leading-5">
                        {getTranslatedText(notification.title)}
                      </p>
                      {notification.body && (
                        getBodyContent(notification.body)
                      )}
                      <p className="text-[11px] text-muted-foreground leading-4 mt-0.5 mb-1">
                        {getRelativeTime(notification.$createdAt)}
                      </p>
                    </div>

                    {index < visibleNotifications.length - 1 && (
                      <Separator className="my-1" />
                    )}
                  </Fragment>
                ))}
              </div>
            </ScrollArea>

            {canLoadMore && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setOlderLoaded((prevState) => prevState + 10);
                  }}
                >
                  {t("view-previous-notifications")}
                </Button>
              </div>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationsTrigger;