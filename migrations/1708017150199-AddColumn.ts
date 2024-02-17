import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddColumn1708017150199 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'USER',
      new TableColumn({
        name: 'identityNumber',
        type: 'varchar',
        isNullable: true,
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
