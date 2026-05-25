import { ResetIcon } from "@sanity/icons";
import { Box, Button, Flex, Stack, Text } from "@sanity/ui";
import type { HomeFavoriteStackPose } from "../lib/home-favorite-stack";

type HomeFavoriteStackPoseEditorProps = {
  pose: HomeFavoriteStackPose;
  label: string;
  onChange: (next: HomeFavoriteStackPose) => void;
  onReset: () => void;
};

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <Box>
      <Flex align="center" justify="space-between" marginBottom={2}>
        <Text size={1}>{label}</Text>
        <Text size={1} muted>
          {value}
          {unit}
        </Text>
      </Flex>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
        style={{ width: "100%" }}
      />
    </Box>
  );
}

export function HomeFavoriteStackPoseEditor({
  pose,
  label,
  onChange,
  onReset,
}: HomeFavoriteStackPoseEditorProps) {
  return (
    <Stack space={3}>
      <Flex align="center" justify="space-between" gap={2}>
        <Text size={1} weight="medium">
          {label}
        </Text>
        <Button
          icon={ResetIcon}
          mode="bleed"
          fontSize={1}
          text="Reset fold"
          onClick={onReset}
        />
      </Flex>
      <Text size={1} muted>
        Tilt and position this card in the stack. Higher order numbers appear in front on the site.
      </Text>
      <SliderRow
        label="Tilt"
        value={pose.rotate}
        min={-18}
        max={18}
        step={1}
        unit="°"
        onChange={(rotate) => onChange({ ...pose, rotate })}
      />
      <SliderRow
        label="Shift sideways"
        value={pose.offsetX}
        min={-22}
        max={22}
        step={1}
        unit="%"
        onChange={(offsetX) => onChange({ ...pose, offsetX })}
      />
      <SliderRow
        label="Shift vertically"
        value={pose.offsetY}
        min={-22}
        max={22}
        step={1}
        unit="%"
        onChange={(offsetY) => onChange({ ...pose, offsetY })}
      />
      <SliderRow
        label="Size"
        value={Math.round(pose.scale * 100)}
        min={82}
        max={108}
        step={1}
        unit="%"
        onChange={(percent) => onChange({ ...pose, scale: percent / 100 })}
      />
    </Stack>
  );
}
