import React, { useState } from "react";
import api from "../api"; // use the centralized API client
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  AppProvider,
  Frame,
  Toast,
  ResourceList,
  ResourceItem,
} from "@shopify/polaris";

// Lazy load ResourcePicker to avoid SSR issues
let ResourcePicker;
if (typeof window !== "undefined") {
  ResourcePicker = require("@shopify/app-bridge-react").ResourcePicker;
}

export default function AppIndex() {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ active: false, content: "" });

  const showToast = (content) => {
    setToast({ active: true, content });
    setTimeout(() => setToast({ active: false, content: "" }), 3000);
  };

  const handleSelection = (resources) => {
    const picks = resources.selection.map((p) => ({
      productId: p.id,
      title: p.title,
      variants: (p.variants || []).map((v) => ({ id: v.id, title: v.title })),
      quantity: 1,
    }));
    setSelectedProducts(picks);
    setShowPicker(false);
  };

  const createBundle = async () => {
    if (!title || selectedProducts.length === 0) {
      showToast("Enter a title and select at least one product");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title,
        items: selectedProducts.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
        })),
      };

      const resp = await api.post("/bundle", payload);

      if (resp.data?.success) {
        showToast(`Bundle created! Product ID: ${resp.data.bundleProductId}`);
        setSelectedProducts([]);
        setTitle("");
      } else {
        showToast("Failed: " + (resp.data?.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      showToast("Server error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppProvider i18n={{}}>
      <Frame>
        <Page title="Simple Bundles by Junoon">
          <Layout>
            <Layout.Section>
              <Card sectioned>
                <Text variant="headingLg">Create a Shopify Bundle</Text>

                <div style={{ marginTop: 12 }}>
                  <input
                    placeholder="Bundle title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 8,
                      fontSize: 16,
                      border: "1px solid #ddd",
                      borderRadius: 4,
                    }}
                  />
                </div>

                <div style={{ marginTop: 12 }}>
                  <Button onClick={() => setShowPicker(true)}>Pick products</Button>
                </div>

                {selectedProducts.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <ResourceList
                      resourceName={{ singular: "product", plural: "products" }}
                      items={selectedProducts}
                      renderItem={(item, i) => (
                        <ResourceItem id={item.productId}>
                          <Text variant="bodyMd" fontWeight="bold">
                            {item.title}
                          </Text>
                          <div style={{ marginTop: 4 }}>
                            Qty:{" "}
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const q = Math.max(1, Number(e.target.value || 1));
                                setSelectedProducts((prev) => {
                                  const updated = [...prev];
                                  updated[i].quantity = q;
                                  return updated;
                                });
                              }}
                              style={{ width: 60, marginLeft: 8 }}
                            />
                          </div>
                        </ResourceItem>
                      )}
                    />
                  </div>
                )}

                <div style={{ marginTop: 16 }}>
                  <Button primary onClick={createBundle} loading={loading}>
                    Create Bundle
                  </Button>
                </div>
              </Card>
            </Layout.Section>
          </Layout>

          {showPicker && ResourcePicker && (
            <ResourcePicker
              resourceType="Product"
              open={showPicker}
              allowMultiple
              onSelection={handleSelection}
              onCancel={() => setShowPicker(false)}
            />
          )}

          {toast.active && (
            <Toast
              content={toast.content}
              onDismiss={() => setToast({ active: false, content: "" })}
            />
          )}
        </Page>
      </Frame>
    </AppProvider>
  );
}
