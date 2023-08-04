# cos-action
TencentCloud COS Action

## Input

- secret_id
- secret_key
- region
- bucket
- assets

## Output

 - count

## Example

```yaml
- name: Upload files to COS
  uses: tvrcgo/cos-action@master
  with:
    secret_id: ${{ secrets.COS_SECRET_ID }}
    secret_key: ${{ secrets.COS_SECRET_KEY }}
    region: ap-guangzhou
    bucket: xxx
    assets: |
      abc/**:/xxx/abc/
      def/**:/xxx/def/
```
